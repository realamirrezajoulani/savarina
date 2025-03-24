from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Post
from schemas.post import PostCreate, PostUpdate
from schemas.relational_schemas import RelationalPostPublic
from utilities.enumerables import LogicalOperator, AdminRole

router = APIRouter()

@router.get(
    "/posts/",
    response_model=list[RelationalPostPublic],
)
async def get_posts(
    *,
    session: AsyncSession = Depends(get_session),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=100),
):

    posts_query = select(Post).offset(offset).limit(limit)
    posts = await session.execute(posts_query)

    posts_list = posts.scalars().all()

    return posts_list


@router.post(
    "/posts/",
    response_model=RelationalPostPublic,
)
async def create_post(
        *,
        session: AsyncSession = Depends(get_session),
        post_create: PostCreate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
):
    if _user["role"] == AdminRole.GENERAL_ADMIN.value:
        final_admin_id = UUID(_user["id"])
    else:
        final_admin_id = post_create.admin_id
    try:

        db_post = Post(
            thumbnail=post_create.thumbnail,
            subject=post_create.subject,
            content=post_create.content,
            admin_id=final_admin_id,
        )


        # Persist to database with explicit transaction control
        session.add(db_post)
        await session.commit()
        await session.refresh(db_post)

        return db_post

    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد پست: "
        )


@router.get(
    "/posts/{post_id}",
    response_model=RelationalPostPublic,
)
async def get_post(
        *,
        session: AsyncSession = Depends(get_session),
        post_id: UUID,
):

    # Attempt to retrieve the author record from the database
    post = await session.get(Post, post_id)

    # If the author is found, process the data and add necessary links
    if not post:
        raise HTTPException(status_code=404, detail="پست پیدا نشد")

    return post



@router.patch(
    "/posts/{post_id}",
    response_model=RelationalPostPublic,
)
async def patch_post(
        *,
        session: AsyncSession = Depends(get_session),
        post_id: UUID,
        post_update: PostUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
):
    # Retrieve the author record from the database using the provided ID.
    post = await session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="پست پیدا نشد")

    if _user["role"] == AdminRole.GENERAL_ADMIN.value and post.admin_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات پست های  دیگر را ندارید")

    # Prepare the update data, excluding unset fields.
    post_data = post_update.model_dump(exclude_unset=True)

    # Apply the update to the author record.
    post.sqlmodel_update(post_data)

    # Commit the transaction and refresh the instance to reflect the changes.
    session.add(post)
    await session.commit()
    await session.refresh(post)

    return post


@router.delete(
    "/posts/{post_id}",
    response_model=RelationalPostPublic,
)
async def delete_post(
    *,
    session: AsyncSession = Depends(get_session),
    post_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
        )
    ),
):
    # Fetch the author record from the database using the provided ID.
    post = await session.get(Post, post_id)

    # If the author is not found, raise a 404 Not Found error.
    if not post:
        raise HTTPException(status_code=404, detail="پست پیدا نشد")

    if _user["role"] == AdminRole.GENERAL_ADMIN.value and post.admin_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای حذف پست های  دیگر را ندارید")


    # Proceed to delete the author if the above conditions are met.
    await session.delete(post)
    await session.commit()  # Commit the transaction to apply the changes

    # Return the author information after deletion.
    return post


@router.get(
    "/posts/search/",
    response_model=list[RelationalPostPublic],
)
async def search_posts(
        *,
        session: AsyncSession = Depends(get_session),
        thumbnail: str | None = None,
        subject: str | None = None,
        operator: LogicalOperator,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=100, le=100),
):

    conditions = []  # Initialize the list of filter conditions

    # Start building the query to fetch authors with pagination.
    query = select(Post).offset(offset).limit(limit)

    # Add filters to the conditions list if the corresponding arguments are provided.
    if thumbnail:
        conditions.append(Post.thumbnail.ilike(f"%{thumbnail}%"))
    if subject:
        conditions.append(Post.subject.ilike(f"%{subject}%"))

    # If no conditions are provided, raise an error.
    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    # Apply the logical operator (AND, OR, or NOT) to combine the conditions.
    if operator == LogicalOperator.AND:
        query = query.where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = query.where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = query.where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    # Execute the query asynchronously.
    post_db = await session.execute(query)
    posts = post_db.scalars().all()  # Retrieve all authors that match the conditions

    # If no authors are found, raise a "not found" error.
    if not posts:
        raise HTTPException(status_code=404, detail="پست پیدا نشد")

    return posts
