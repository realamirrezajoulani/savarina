from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Comment
from schemas.comment import CommentCreate, CommentUpdate
from schemas.relational_schemas import RelationalCommentPublic
from utilities.authentication import oauth2_scheme
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
):
    comments_query = select(Comment).offset(offset).limit(limit).order_by(Comment.created_at)
    comments = await session.execute(comments_query)
    return comments.scalars().all()


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
        _token: str = Depends(oauth2_scheme),
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
):
    comment = await session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

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
        _token: str = Depends(oauth2_scheme),
):
    comment = await session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and comment.customer_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات نظر های دیگر را ندارید")

    comment_data = comment_update.model_dump(exclude_unset=True)

    comment.sqlmodel_update(comment_data)

    await session.commit()
    await session.refresh(comment)

    return comment


@router.delete(
    "/comments/{comment_id}",
    response_model=dict[str, str],
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
    _token: str = Depends(oauth2_scheme),
):
    comment = await session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and comment.customer_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات نظر های  دیگر را ندارید")

    await session.delete(comment)
    await session.commit()

    return {"msg": "کامنت با موفقیت حذف شد"}


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
):

    conditions = []
    if subject:
        conditions.append(Comment.subject == subject)
    if status:
        conditions.append(Comment.status == status)

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    if operator == LogicalOperator.AND:
        query = select(Comment).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(Comment).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(Comment).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)
    comment_db = await session.execute(query)
    comments = comment_db.scalars().all()
    if not comments:
        raise HTTPException(status_code=404, detail="کامنت پیدا نشد")

    return comments
