from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Invoice, Rental
from schemas.invoice import InvoiceUpdate, InvoiceCreate
from schemas.relational_schemas import RelationalInvoicePublic
from utilities.authentication import oauth2_scheme
from utilities.enumerables import LogicalOperator, InvoiceStatus, AdminRole, CustomerRole

router = APIRouter()


@router.get(
    "/invoices/",
    response_model=list[RelationalInvoicePublic],
)
async def get_invoices(
    *,
    session: AsyncSession = Depends(get_session),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=100),
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
            CustomerRole.CUSTOMER.value
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    if _user["role"] == CustomerRole.CUSTOMER.value:
        invoice_query = (
            select(Invoice)
            .join(Rental)
            .where(Rental.customer_id == _user["id"])
        )
        result = await session.execute(invoice_query)
        return result.scalars().unique().all()

    invoices_query = select(Invoice).offset(offset).limit(limit)
    invoices = await session.execute(invoices_query)
    return invoices.scalars().all()


@router.post(
    "/invoices/",
    response_model=RelationalInvoicePublic,
)
async def create_invoice(
        *,
        session: AsyncSession = Depends(get_session),
        invoice_create: InvoiceCreate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    try:
        db_invoice = Invoice(
            total_amount=invoice_create.total_amount,
            tax=invoice_create.tax,
            discount=invoice_create.discount,
            final_amount=invoice_create.final_amount,
            status=invoice_create.status,
        )

        session.add(db_invoice)
        await session.commit()
        await session.refresh(db_invoice)

        return db_invoice

    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد فاکتور: "
        )


@router.get(
    "/invoices/{invoice_id}",
    response_model=RelationalInvoicePublic,
)
async def get_invoice(
        *,
        session: AsyncSession = Depends(get_session),
        invoice_id: UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    invoice = await session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="فاکتور پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value:
        invoice_query = (
            select(Invoice)
            .where(Invoice.id == invoice.id)
            .join(Rental)
            .where(Rental.customer_id == _user["id"])
        )
        result = await session.execute(invoice_query)

        if not result.scalars().first():
            raise HTTPException(status_code=403,
                                detail="شما دسترسی لازم برای مشاهده اطلاعات فاکتور های  دیگر را ندارید")

    return invoice



@router.patch(
    "/invoices/{invoice_id}",
    response_model=RelationalInvoicePublic,
)
async def patch_invoice(
        *,
        session: AsyncSession = Depends(get_session),
        invoice_id: UUID,
        invoice_update: InvoiceUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    invoice = await session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="فاکتور پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value:
        invoice_query = (
            select(Invoice)
            .where(Invoice.id == invoice.id)
            .join(Rental)
            .where(Rental.customer_id == _user["id"])
        )
        result = await session.execute(invoice_query)

        if not result.scalars().first():
            raise HTTPException(status_code=403,
                                detail="شما دسترسی لازم برای ویرایش اطلاعات فاکتور های  دیگر را ندارید")

    invoice_data = invoice_update.model_dump(exclude_unset=True)

    invoice.sqlmodel_update(invoice_data)

    await session.commit()
    await session.refresh(invoice)

    return invoice


@router.delete(
    "/invoices/{invoice_id}",
    response_model=RelationalInvoicePublic,
)
async def delete_invoice(
    *,
    session: AsyncSession = Depends(get_session),
    invoice_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
            CustomerRole.CUSTOMER.value
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    invoice = await session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="فاکتور پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value:
        invoice_query = (
            select(Invoice)
            .where(Invoice.id == invoice.id)
            .join(Rental)
            .where(Rental.customer_id == _user["id"])
        )
        result = await session.execute(invoice_query)

        if not result.scalars().first():
            raise HTTPException(status_code=403,
                                detail="شما دسترسی لازم برای حذف اطلاعات فاکتور های  دیگر را ندارید")

    await session.delete(invoice)
    await session.commit()

    return {"msg": "فاکتور با موفقیت حذف شد"}


@router.get(
    "/invoices/search/",
    response_model=list[RelationalInvoicePublic],
)
async def search_invoices(
        *,
        session: AsyncSession = Depends(get_session),
        total_amount: int | None = None,
        tax: int | None = None,
        discount: int | None = None,
        final_amount: int | None = None,
        status: InvoiceStatus | None = None,
        operator: LogicalOperator,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=100, le=100),
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    conditions = []
    if total_amount:
        conditions.append(Invoice.total_amount >= total_amount)
    if tax:
        conditions.append(Invoice.tax >= tax)
    if discount:
        conditions.append(Invoice.discount >= discount)
    if final_amount:
        conditions.append(Invoice.final_amount >= final_amount)
    if status:
        conditions.append(Invoice.status == status)

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    if operator == LogicalOperator.AND:
        query = select(Invoice).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(Invoice).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(Invoice).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)
    if _user["role"] == CustomerRole.CUSTOMER.value:
        query = query.join(Rental).where(Rental.customer_id == _user["id"])

    invoice_db = await session.execute(query)
    invoices = invoice_db.scalars().all()
    if not invoices:
        raise HTTPException(status_code=404, detail="فاکتور پیدا نشد")

    return invoices
