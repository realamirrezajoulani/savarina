import uuid

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Post
from schemas.post import PostCreate, PostUpdate
from schemas.relational_schemas import RelationalPostPublic
from utilities.authentication import oauth2_scheme
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
    return posts.scalars().all()


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
        _token: str = Depends(oauth2_scheme),
):
    final_admin_id = uuid.UUID(_user["id"]) if _user["role"] == AdminRole.GENERAL_ADMIN.value else post_create.admin_id

    try:
        db_post = Post(
            thumbnail=post_create.thumbnail,
            subject=post_create.subject,
            content=post_create.content,
            admin_id=final_admin_id,
        )

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
        post_id: uuid.UUID,
):
    post = await session.get(Post, post_id)
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
        post_id: uuid.UUID,
        post_update: PostUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    post = await session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="پست پیدا نشد")

    if _user["role"] == AdminRole.GENERAL_ADMIN.value and post.admin_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات پست های  دیگر را ندارید")

    post_data = post_update.model_dump(exclude_unset=True)

    post.sqlmodel_update(post_data)

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
    post_id: uuid.UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    post = await session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="پست پیدا نشد")

    if _user["role"] == AdminRole.GENERAL_ADMIN.value and post.admin_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای حذف پست های  دیگر را ندارید")

    await session.delete(post)
    await session.commit()

    return {"msg": "پست با موفقیت حذف شد"}


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

    conditions = []
    if thumbnail:
        conditions.append(Post.thumbnail.ilike(f"%{thumbnail}%"))
    if subject:
        conditions.append(Post.subject.ilike(f"%{subject}%"))

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    if operator == LogicalOperator.AND:
        query = select(Post).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(Post).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(Post).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)

    post_db = await session.execute(query)
    posts = post_db.scalars().all()
    if not posts:
        raise HTTPException(status_code=404, detail="پست پیدا نشد")

    return posts
