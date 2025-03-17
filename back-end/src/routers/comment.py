from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Comment
from schemas.comment import CommentCreate, CommentUpdate
from schemas.relational_schemas import RelationalCommentPublic
from utilities.enumerables import LogicalOperator, CommentSubject, CommentStatus, AdminRole, CustomerRole

router = APIRouter()

@router.get(
    "/comments/",
    response_model=list[RelationalCommentPublic],
)
async def get_comments(
    *,
    session: AsyncSession = Depends(get_session),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=100),
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
            CustomerRole.CUSTOMER.value,
        )
    ),
):
    if _user["role"] == CustomerRole.CUSTOMER.value:
        comment_query = select(Comment).where(Comment.customer_id == _user["id"])
        comments = await session.execute(comment_query)

        comments_list = comments.scalars().all()

        return comments_list


    comments_query = select(Comment).offset(offset).limit(limit)
    comments = await session.execute(comments_query)

    comments_list = comments.scalars().all()

    return comments_list


@router.post(
    "/comments/",
    response_model=RelationalCommentPublic,
)
async def create_comment(
        *,
        session: AsyncSession = Depends(get_session),
        comment_create: CommentCreate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
):
    if _user["role"] == CustomerRole.CUSTOMER.value:
        final_customer_id = UUID(_user["id"])
        final_status = CommentStatus.PENDING.value
    else:
        final_customer_id = comment_create.customer_id
        final_status = comment_create.status

    try:

        db_comment = Comment(
            subject=comment_create.subject,
            content=comment_create.content,
            status=final_status,
            customer_id=final_customer_id,
        )


        # Persist to database with explicit transaction control
        session.add(db_comment)
        await session.commit()
        await session.refresh(db_comment)

        return db_comment

    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد کامنت: "
        )

@router.get(
    "/comments/{comment_id}",
    response_model=RelationalCommentPublic,
)
async def get_comment(
        *,
        session: AsyncSession = Depends(get_session),
        comment_id: UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
):

    # Attempt to retrieve the author record from the database
    comment = await session.get(Comment, comment_id)

    # If the author is found, process the data and add necessary links
    if not comment:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and comment.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای مشاهده اطلاعات نظر های  دیگر را ندارید")

    return comment




@router.patch(
    "/comments/{comment_id}",
    response_model=RelationalCommentPublic,
)
async def patch_comment(
        *,
        session: AsyncSession = Depends(get_session),
        comment_id: UUID,
        comment_update: CommentUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),

):
    # Retrieve the author record from the database using the provided ID.
    comment = await session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and comment.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات نظر های  دیگر را ندارید")

    # Prepare the update data, excluding unset fields.
    comment_data = comment_update.model_dump(exclude_unset=True)

    # Apply the update to the author record.
    comment.sqlmodel_update(comment_data)

    # Commit the transaction and refresh the instance to reflect the changes.
    session.add(comment)
    await session.commit()
    await session.refresh(comment)

    return comment


@router.delete(
    "/comments/{comment_id}",
    response_model=RelationalCommentPublic,
)
async def delete_comment(
    *,
    session: AsyncSession = Depends(get_session),
    comment_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
            CustomerRole.CUSTOMER.value,
        )
    ),
):
    # Fetch the author record from the database using the provided ID.
    comment = await session.get(Comment, comment_id)

    # If the author is not found, raise a 404 Not Found error.
    if not comment:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and comment.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات نظر های  دیگر را ندارید")


    # Proceed to delete the author if the above conditions are met.
    await session.delete(comment)
    await session.commit()  # Commit the transaction to apply the changes

    # Return the author information after deletion.
    return comment

@router.get(
    "/comments/search/",
    response_model=list[RelationalCommentPublic],
)
async def search_comments(
        *,
        session: AsyncSession = Depends(get_session),
        subject: CommentSubject | None = None,
        status: CommentStatus | None = None,
        operator: LogicalOperator,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=100, le=100),
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
):

    conditions = []  # Initialize the list of filter conditions

    # Start building the query to fetch authors with pagination.
    query = select(Comment).offset(offset).limit(limit)

    # Add filters to the conditions list if the corresponding arguments are provided.
    if subject:
        conditions.append(Comment.subject == subject)
    if status:
        conditions.append(Comment.status == status)

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
    comment_db = await session.execute(query)
    comments = comment_db.scalars().all()  # Retrieve all authors that match the conditions

    # If no authors are found, raise a "not found" error.
    if not comments:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

    return comments
