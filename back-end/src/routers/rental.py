from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Rental
from schemas.relational_schemas import RelationalRentalPublic
from schemas.rental import RentalCreate, RentalUpdate
from utilities.authentication import oauth2_scheme
from utilities.enumerables import LogicalOperator, AdminRole, CustomerRole

router = APIRouter()

@router.get(
    "/rentals/",
    response_model=list[RelationalRentalPublic],
)
async def get_rentals(
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
    _token: str = Depends(oauth2_scheme),
):
    if _user["role"] == CustomerRole.CUSTOMER.value:
        rental_query = select(Rental).where(Rental.customer_id == _user["id"])
        rentals = await session.execute(rental_query)

        rentals_list = rentals.scalars().all()

        return rentals_list

    rentals_query = select(Rental).offset(offset).limit(limit)
    rentals = await session.execute(rentals_query)

    rentals_list = rentals.scalars().all()

    return rentals_list



@router.post(
    "/rentals/",
    response_model=RelationalRentalPublic,
)
async def create_rental(
        *,
        session: AsyncSession = Depends(get_session),
        rental_create: RentalCreate,
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
    else:
        final_customer_id = rental_create.customer_id

    try:

        db_rental = Rental(
            rental_start_date=rental_create.rental_start_date,
            rental_end_date=rental_create.rental_end_date,
            total_amount=rental_create.total_amount,
            customer_id=final_customer_id,
            vehicle_id=rental_create.vehicle_id,
            invoice_id=rental_create.invoice_id,
        )


        # Persist to database with explicit transaction control
        session.add(db_rental)
        await session.commit()
        await session.refresh(db_rental)

        return db_rental


    except Exception as e:
        # Critical error handling with transaction rollback
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد کرایه: "
        )

@router.get(
    "/rentals/{rental_id}",
    response_model=RelationalRentalPublic,
)
async def get_rental(
        *,
        session: AsyncSession = Depends(get_session),
        rental_id: UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    # Attempt to retrieve the author record from the database
    rental = await session.get(Rental, rental_id)

    # If the author is found, process the data and add necessary links
    if not rental:
        raise HTTPException(status_code=404, detail="کرایه پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and rental.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای مشاهده اطلاعات کرایه های  دیگر را ندارید")

    return rental



@router.patch(
    "/rentals/{rental_id}",
    response_model=RelationalRentalPublic,
)
async def patch_rental(
        *,
        session: AsyncSession = Depends(get_session),
        rental_id: UUID,
        rental_update: RentalUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    # Retrieve the author record from the database using the provided ID.
    rental = await session.get(Rental, rental_id)
    if not rental:
        raise HTTPException(status_code=404, detail="کرایه پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and rental.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات کرایه های  دیگر را ندارید")

    # Prepare the update data, excluding unset fields.
    rental_data = rental_update.model_dump(exclude_unset=True)

    # Apply the update to the author record.
    rental.sqlmodel_update(rental_data)

    # Commit the transaction and refresh the instance to reflect the changes.
    session.add(rental)
    await session.commit()
    await session.refresh(rental)

    return rental


@router.delete(
    "/rentals/{rental_id}",
    response_model=RelationalRentalPublic,
)
async def delete_rental(
    *,
    session: AsyncSession = Depends(get_session),
    rental_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
            CustomerRole.CUSTOMER.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    # Fetch the author record from the database using the provided ID.
    rental = await session.get(Rental, rental_id)

    # If the author is not found, raise a 404 Not Found error.
    if not rental:
        raise HTTPException(status_code=404, detail="کرایه پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and rental.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای حذف کرایه های  دیگر را ندارید")

    await session.delete(rental)
    await session.commit()

    return {"msg": "اجاره با موفقیت حذف شد"}

@router.get(
    "/rentals/search/",
    response_model=list[RelationalRentalPublic],
)
async def search_rentals(
        *,
        session: AsyncSession = Depends(get_session),
        rental_start_date: str | None = None,
        rental_end_date: str | None = None,
        total_amount: int | None = None,
        customer_id: UUID | None = None,
        vehicle_id: UUID | None = None,
        invoice_id: UUID | None = None,
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
    query = select(Rental).offset(offset).limit(limit)

    if _user["role"] == CustomerRole.CUSTOMER.value:
        query = query.where(Rental.customer_id == _user["id"])

    # Add filters to the conditions list if the corresponding arguments are provided.
    if rental_start_date:
        conditions.append(Rental.rental_start_date == rental_start_date)
    if rental_end_date:
        conditions.append(Rental.rental_end_date == rental_end_date)
    if total_amount:
        conditions.append(Rental.total_amount >= total_amount)
    if customer_id:
        conditions.append(Rental.customer_id == customer_id)
    if vehicle_id:
        conditions.append(Rental.vehicle_id == vehicle_id)
    if invoice_id:
        conditions.append(Rental.invoice_id == invoice_id)

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
    rental_db = await session.execute(query)
    rentals = rental_db.scalars().all()  # Retrieve all authors that match the conditions

    # If no authors are found, raise a "not found" error.
    if not rentals:
        raise HTTPException(status_code=404, detail="کرایه پیدا نشد")

    return rentals
