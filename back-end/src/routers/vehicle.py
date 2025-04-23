from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Vehicle
from schemas.relational_schemas import RelationalVehiclePublic
from schemas.vehicle import VehicleCreate, VehicleUpdate
from utilities.authentication import oauth2_scheme
from utilities.enumerables import LogicalOperator, CarStatus, Brand, AdminRole, CustomerRole

router = APIRouter()


@router.get(
    "/vehicles/",
    response_model=list[RelationalVehiclePublic],
)
async def get_vehicles(
    *,
    session: AsyncSession = Depends(get_session),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=100),
):
    vehicles_query = select(Vehicle).offset(offset).limit(limit).order_by(Vehicle.created_at)
    vehicles = await session.execute(vehicles_query)
    return vehicles.scalars().all()


@router.post(
    "/vehicles/",
    response_model=RelationalVehiclePublic,
)
async def create_vehicle(
        *,
        session: AsyncSession = Depends(get_session),
        vehicle_create: VehicleCreate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    try:
        db_vehicle = Vehicle(
            plate_number=vehicle_create.plate_number,
            location=vehicle_create.location,
            local_image_address=vehicle_create.local_image_address,
            brand=vehicle_create.brand,
            model=vehicle_create.model,
            year=vehicle_create.year,
            color=vehicle_create.color,
            mileage=vehicle_create.mileage,
            status=vehicle_create.status,
            hourly_rental_rate=vehicle_create.hourly_rental_rate,
            security_deposit=vehicle_create.security_deposit,
        )


        session.add(db_vehicle)
        await session.commit()
        await session.refresh(db_vehicle)

        return db_vehicle

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=409,
            detail="شماره پلاک قبلا ثبت شده است"
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد وسیله نقلیه: "
        )


@router.get(
    "/vehicles/{vehicle_id}",
    response_model=RelationalVehiclePublic,
)
async def get_vehicle(
        *,
        session: AsyncSession = Depends(get_session),
        vehicle_id: UUID,
):
    vehicle = await session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="وسیله نقلیه پیدا نشد")

    return vehicle


@router.patch(
    "/vehicles/{vehicle_id}",
    response_model=RelationalVehiclePublic,
)
async def patch_vehicle(
        *,
        session: AsyncSession = Depends(get_session),
        vehicle_id: UUID,
        vehicle_update: VehicleUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    vehicle = await session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="وسیله نقلیه پیدا نشد")

    vehicle_data = vehicle_update.model_dump(exclude_unset=True)

    vehicle.sqlmodel_update(vehicle_data)

    await session.commit()
    await session.refresh(vehicle)

    return vehicle


@router.delete(
    "/vehicles/{vehicle_id}",
    response_model=dict[str, str],
)
async def delete_vehicle(
    *,
    session: AsyncSession = Depends(get_session),
    vehicle_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    vehicle = await session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="وسیله نقلیه پیدا نشد")

    await session.delete(vehicle)
    await session.commit()

    return {"msg": "وسیله نقلیه با موفقیت حذف شد"}


@router.get(
    "/vehicles/search/",
    response_model=list[RelationalVehiclePublic],
)
async def search_vehicles(
        *,
        session: AsyncSession = Depends(get_session),
        hourly_rental_rate: int | None = None,
        security_deposit: int | None = None,
        status: CarStatus | None = None,
        brand: Brand | None = None,
        plate_number: str | None = None,
        operator: LogicalOperator,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=100, le=100),
):
    conditions = []
    if hourly_rental_rate:
        conditions.append(Vehicle.hourly_rental_rate >= hourly_rental_rate)
    if security_deposit:
        conditions.append(Vehicle.security_deposit >= security_deposit)
    if status:
        conditions.append(Vehicle.status == status)
    if brand:
        conditions.append(Vehicle.brand == brand)
    if plate_number:
        conditions.append(Vehicle.plate_number == plate_number)

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")


    if operator == LogicalOperator.AND:
        query = select(Vehicle).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(Vehicle).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(Vehicle).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)
    vehicle_db = await session.execute(query)
    vehicles = vehicle_db.scalars().all()
    if not vehicles:
        raise HTTPException(status_code=404, detail="وسیله نقلیه پیدا نشد")

    return vehicles
