import uuid

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Rental, Vehicle
from schemas.relational_schemas import RelationalRentalPublic
from schemas.rental import RentalCreate, RentalUpdate
from utilities.authentication import oauth2_scheme
from utilities.enumerables import LogicalOperator, AdminRole, CustomerRole, CarStatus

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
        return rentals.scalars().all()

    rentals_query = select(Rental).offset(offset).limit(limit)
    rentals = await session.execute(rentals_query)
    return rentals.scalars().all()


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
    final_customer_id = uuid.UUID(_user["id"]) if _user["role"] == AdminRole.GENERAL_ADMIN.value else rental_create.customer_id

    try:
        db_rental = Rental(
            rental_start_date=rental_create.rental_start_date,
            rental_end_date=rental_create.rental_end_date,
            total_amount=rental_create.total_amount,
            customer_id=final_customer_id,
            vehicle_id=rental_create.vehicle_id,
            invoice_id=rental_create.invoice_id,
        )

        vehicle = await session.get(Vehicle, rental_create.vehicle_id)
        vehicle.status = CarStatus.RENTED.value

        session.add(db_rental)
        await session.commit()
        await session.refresh(db_rental)

        return db_rental

    except Exception as e:
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
        rental_id: uuid.UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    rental = await session.get(Rental, rental_id)
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
        rental_id: uuid.UUID,
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
    rental = await session.get(Rental, rental_id)
    if not rental:
        raise HTTPException(status_code=404, detail="کرایه پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and rental.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات کرایه های  دیگر را ندارید")

    rental_data = rental_update.model_dump(exclude_unset=True)

    rental.sqlmodel_update(rental_data)

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
    rental_id: uuid.UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
            CustomerRole.CUSTOMER.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    rental = await session.get(Rental, rental_id)

    if not rental:
        raise HTTPException(status_code=404, detail="کرایه پیدا نشد")

    if _user["role"] == CustomerRole.CUSTOMER.value and rental.customer_id != _user["id"]:
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای حذف کرایه های  دیگر را ندارید")

    vehicle = await session.get(Vehicle, rental.vehicle_id)
    vehicle.status = CarStatus.AVAILABLE.value

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
        customer_id: uuid.UUID | None = None,
        vehicle_id: uuid.UUID | None = None,
        invoice_id: uuid.UUID | None = None,
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

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    if operator == LogicalOperator.AND:
        query = select(Rental).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(Rental).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(Rental).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)

    if _user["role"] == CustomerRole.CUSTOMER.value:
        query = query.where(Rental.customer_id == _user["id"])

    rental_db = await session.execute(query)
    rentals = rental_db.scalars().all()
    if not rentals:
        raise HTTPException(status_code=404, detail="کرایه پیدا نشد")

    return rentals
