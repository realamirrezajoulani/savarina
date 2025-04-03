from jdatetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from dependencies import get_session, require_roles
from models.relational_models import Vehicle, Comment, Post, Invoice, Customer, Admin, Payment
from utilities.authentication import oauth2_scheme
from utilities.enumerables import AdminRole

router = APIRouter()


@router.get("/stats/")
async def get_stats(*,
              session: AsyncSession = Depends(get_session),
              _user: dict = Depends(
                  require_roles(
                      AdminRole.SUPER_ADMIN.value,
                      AdminRole.GENERAL_ADMIN.value,
                  )
              ),
              _token: str = Depends(oauth2_scheme),
              ):
    tehran_now = datetime.now(ZoneInfo("Asia/Tehran"))
    today_start = tehran_now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    fmt = "%Y/%m/%d %H:%M:%S"
    today_start_str = today_start.strftime(fmt)
    today_end_str = today_end.strftime(fmt)

    if _user["role"] == AdminRole.GENERAL_ADMIN.value:
        stmt = select(
            select(func.count(Vehicle.id)).scalar_subquery().label("vehicle_count"),
            select(func.count(Comment.id)).scalar_subquery().label("comment_count"),
            select(func.count(Invoice.id)).scalar_subquery().label("invoice_count"),
            select(func.count(Customer.id)).scalar_subquery().label("customer_count"),
            select(
                func.count(Payment.id)
            ).where(
                Payment.payment_datetime.between(today_start_str, today_end_str)
            ).scalar_subquery().label("today_purchase_count"),
        )
    else:
        stmt = select(
            select(func.count(Vehicle.id)).scalar_subquery().label("vehicle_count"),
            select(func.count(Comment.id)).scalar_subquery().label("comment_count"),
            select(func.count(Post.id)).scalar_subquery().label("post_count"),
            select(func.count(Invoice.id)).scalar_subquery().label("invoice_count"),
            select(func.count(Customer.id)).scalar_subquery().label("customer_count"),
            select(func.count(Admin.id)).scalar_subquery().label("admin_count"),
            select(
                func.count(Payment.id)
            ).where(
                Payment.payment_datetime.between(today_start_str, today_end_str)
            ).scalar_subquery().label("today_purchase_count"),
        )

    result = await session.execute(stmt)
    row = result.one()


    if _user["role"] == AdminRole.GENERAL_ADMIN.value:
        stats = {
            "vehicle_count": row.vehicle_count,
            "comment_count": row.comment_count,
            "invoice_count": row.invoice_count,
            "customer_count": row.customer_count,
            "today_purchase_count": row.today_purchase_count
        }
    else:
        stats = {
            "vehicle_count": row.vehicle_count,
            "comment_count": row.comment_count,
            "post_count": row.post_count,
            "invoice_count": row.invoice_count,
            "customer_count": row.customer_count,
            "admin_count": row.admin_count,
            "today_purchase_count": row.today_purchase_count
        }

    return stats
