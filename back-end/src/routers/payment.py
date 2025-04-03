from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Payment
from schemas.payment import PaymentCreate, PaymentUpdate
from schemas.relational_schemas import RelationalPaymentPublic
from utilities.authentication import oauth2_scheme
from utilities.enumerables import LogicalOperator, PaymentMethod, PaymentStatus, AdminRole

router = APIRouter()


@router.get(
    "/payments/",
    response_model=list[RelationalPaymentPublic],
)
async def get_payments(
    *,
    session: AsyncSession = Depends(get_session),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=100),
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):

    payments_query = select(Payment).offset(offset).limit(limit)
    payments = await session.execute(payments_query)
    return payments.scalars().all()


@router.post(
    "/payments/",
    response_model=RelationalPaymentPublic,
)
async def create_payment(
        *,
        session: AsyncSession = Depends(get_session),
        payment_create: PaymentCreate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    try:
        db_payment = Payment(
            payment_datetime=payment_create.payment_datetime,
            payment_method=payment_create.payment_method,
            transaction_id=payment_create.transaction_id,
            amount=payment_create.amount,
            payment_status=payment_create.payment_status,
            invoice_id=payment_create.invoice_id,
        )

        session.add(db_payment)
        await session.commit()
        await session.refresh(db_payment)

        return db_payment

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"شناسه تراکنش قبلا وارد شده است"
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد پرداخت: "
        )


@router.get(
    "/payments/{payment_id}",
    response_model=RelationalPaymentPublic,
)
async def get_payment(
        *,
        session: AsyncSession = Depends(get_session),
        payment_id: UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):

    payment = await session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="پرداخت پیدا نشد")

    return payment


@router.patch(
    "/payments/{payment_id}",
    response_model=RelationalPaymentPublic,
)
async def patch_payment(
        *,
        session: AsyncSession = Depends(get_session),
        payment_id: UUID,
        payment_update: PaymentUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    payment = await session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="پرداخت پیدا نشد")

    payment_data = payment_update.model_dump(exclude_unset=True)

    payment.sqlmodel_update(payment_data)

    await session.commit()
    await session.refresh(payment)

    return payment


@router.delete(
    "/payments/{payment_id}",
    response_model=dict[str, str],
)
async def delete_payment(
    *,
    session: AsyncSession = Depends(get_session),
    payment_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    payment = await session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="پرداخت پیدا نشد")

    await session.delete(payment)
    await session.commit()

    return {"msg": "پرداخت با موفقیت حذف شد"}

@router.get(
    "/payments/search/",
    response_model=list[RelationalPaymentPublic],
)
async def search_payments(
        *,
        session: AsyncSession = Depends(get_session),
        payment_datetime: str | None = None,
        transaction_id: int | None = None,
        payment_method: PaymentMethod | None = None,
        payment_status: PaymentStatus | None = None,
        operator: LogicalOperator,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=100, le=100),
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    conditions = []
    if payment_datetime:
        conditions.append(Payment.payment_datetime == payment_datetime)
    if transaction_id:
        conditions.append(Payment.transaction_id == transaction_id)
    if payment_method:
        conditions.append(Payment.payment_method == payment_method)
    if payment_status:
        conditions.append(Payment.payment_status == payment_status)

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    if operator == LogicalOperator.AND:
        query = select(Payment).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(Payment).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(Payment).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)
    payment_db = await session.execute(query)
    payments = payment_db.scalars().all()
    if not payments:
        raise HTTPException(status_code=404, detail="پرداخت پیدا نشد")

    return payments
