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
        invoices_list = result.scalars().unique().all()
        return invoices_list

    invoices_query = select(Invoice).offset(offset).limit(limit)
    invoices = await session.execute(invoices_query)

    invoices_list = invoices.scalars().all()

    return invoices_list



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


        # Persist to database with explicit transaction control
        session.add(db_invoice)
        await session.commit()
        await session.refresh(db_invoice)

        return db_invoice


    except Exception as e:
        # Critical error handling with transaction rollback
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
    # Attempt to retrieve the author record from the database
    invoice = await session.get(Invoice, invoice_id)

    # If the author is found, process the data and add necessary links
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
    # Retrieve the author record from the database using the provided ID.
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

    # Prepare the update data, excluding unset fields.
    invoice_data = invoice_update.model_dump(exclude_unset=True)

    # Apply the update to the author record.
    invoice.sqlmodel_update(invoice_data)

    # Commit the transaction and refresh the instance to reflect the changes.
    session.add(invoice)
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
    # Fetch the author record from the database using the provided ID.
    invoice = await session.get(Invoice, invoice_id)

    # If the author is not found, raise a 404 Not Found error.
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

    # Proceed to delete the author if the above conditions are met.
    await session.delete(invoice)
    await session.commit()  # Commit the transaction to apply the changes

    # Return the author information after deletion.
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

    conditions = []  # Initialize the list of filter conditions

    # Start building the query to fetch authors with pagination.
    query = select(Invoice).offset(offset).limit(limit)

    if _user["role"] == CustomerRole.CUSTOMER.value:
        query = query.join(Rental).where(Rental.customer_id == _user["id"])

    # Add filters to the conditions list if the corresponding arguments are provided.
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
    invoice_db = await session.execute(query)
    invoices = invoice_db.scalars().all()

    if not invoices:
        raise HTTPException(status_code=404, detail="فاکتور پیدا نشد")

    return invoices
