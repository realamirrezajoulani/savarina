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

    vehicles_query = select(Vehicle).offset(offset).limit(limit)
    vehicles = await session.execute(vehicles_query)

    vehicles_list = vehicles.scalars().all()

    return vehicles_list



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


        # Persist to database with explicit transaction control
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
        # Critical error handling with transaction rollback
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

    # Attempt to retrieve the author record from the database
    vehicle = await session.get(Vehicle, vehicle_id)

    # If the author is found, process the data and add necessary links
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
    # Retrieve the author record from the database using the provided ID.
    vehicle = await session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="وسیله نقلیه پیدا نشد")

    # Prepare the update data, excluding unset fields.
    vehicle_data = vehicle_update.model_dump(exclude_unset=True)

    # Apply the update to the author record.
    vehicle.sqlmodel_update(vehicle_data)

    # Commit the transaction and refresh the instance to reflect the changes.
    session.add(vehicle)
    await session.commit()
    await session.refresh(vehicle)

    return vehicle


@router.delete(
    "/vehicles/{vehicle_id}",
    response_model=RelationalVehiclePublic,
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
    # Fetch the author record from the database using the provided ID.
    vehicle = await session.get(Vehicle, vehicle_id)

    # If the author is not found, raise a 404 Not Found error.
    if not vehicle:
        raise HTTPException(status_code=404, detail="وسیله نقلیه پیدا نشد")

    # Proceed to delete the author if the above conditions are met.
    await session.delete(vehicle)
    await session.commit()  # Commit the transaction to apply the changes

    # Return the author information after deletion.
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

    conditions = []  # Initialize the list of filter conditions

    # Start building the query to fetch authors with pagination.
    query = select(Vehicle).offset(offset).limit(limit)

    # Add filters to the conditions list if the corresponding arguments are provided.
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
    vehicle_db = await session.execute(query)
    vehicles = vehicle_db.scalars().all()  # Retrieve all authors that match the conditions

    # If no authors are found, raise a "not found" error.
    if not vehicles:
        raise HTTPException(status_code=404, detail="وسیله نقلیه پیدا نشد")

    return vehicles
