from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import VehicleInsurance
from schemas.relational_schemas import RelationalVehicleInsurancePublic
from schemas.vehicle_insurance import VehicleInsuranceCreate, VehicleInsuranceUpdate
from utilities.authentication import oauth2_scheme
from utilities.enumerables import LogicalOperator, InsuranceType, AdminRole

router = APIRouter()


@router.get(
    "/vehicle_insurances/",
    response_model=list[RelationalVehicleInsurancePublic],
)
async def get_vehicle_insurances(
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
    vehicle_insurances_query = select(VehicleInsurance).offset(offset).limit(limit)
    vehicle_insurances = await session.execute(vehicle_insurances_query)
    return vehicle_insurances.scalars().all()


@router.post(
    "/vehicle_insurances/",
    response_model=RelationalVehicleInsurancePublic,
)
async def create_vehicle_insurance(
        *,
        session: AsyncSession = Depends(get_session),
        vehicle_insurance_create: VehicleInsuranceCreate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
    _token: str = Depends(oauth2_scheme),
):
    try:
        db_vehicle_insurance = VehicleInsurance(
            insurance_company=vehicle_insurance_create.insurance_company,
            insurance_type=vehicle_insurance_create.insurance_type,
            policy_number=vehicle_insurance_create.policy_number,
            start_date=vehicle_insurance_create.start_date,
            expiration_date=vehicle_insurance_create.expiration_date,
            premium=vehicle_insurance_create.premium,
            vehicle_id=vehicle_insurance_create.vehicle_id,
        )

        session.add(db_vehicle_insurance)
        await session.commit()
        await session.refresh(db_vehicle_insurance)

        return db_vehicle_insurance

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=409,
            detail="شماره بیمه قبلا ثبت شده است"
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد بیمه وسیله نقلیه: "
        )


@router.get(
    "/vehicle_insurances/{vehicle_insurance_id}",
    response_model=RelationalVehicleInsurancePublic,
)
async def get_vehicle_insurance(
        *,
        session: AsyncSession = Depends(get_session),
        vehicle_insurance_id: UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    vehicle_insurance = await session.get(VehicleInsurance, vehicle_insurance_id)
    if not vehicle_insurance:
        raise HTTPException(status_code=404, detail="بیمه وسیله نقلیه پیدا نشد")

    return vehicle_insurance


@router.patch(
    "/vehicle_insurances/{vehicle_insurance_id}",
    response_model=RelationalVehicleInsurancePublic,
)
async def patch_vehicle_insurance(
        *,
        session: AsyncSession = Depends(get_session),
        vehicle_insurance_id: UUID,
        vehicle_insurance_update: VehicleInsuranceUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    vehicle_insurance = await session.get(VehicleInsurance, vehicle_insurance_id)
    if not vehicle_insurance:
        raise HTTPException(status_code=404, detail="بیمه وسیله نقلیه پیدا نشد")

    vehicle_insurance_data = vehicle_insurance_update.model_dump(exclude_unset=True)

    vehicle_insurance.sqlmodel_update(vehicle_insurance_data)

    await session.commit()
    await session.refresh(vehicle_insurance)

    return vehicle_insurance


@router.delete(
    "/vehicle_insurances/{vehicle_insurance_id}",
    response_model=dict[str, str],
)
async def delete_vehicle_insurance(
    *,
    session: AsyncSession = Depends(get_session),
    vehicle_insurance_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    vehicle_insurance = await session.get(VehicleInsurance, vehicle_insurance_id)

    if not vehicle_insurance:
        raise HTTPException(status_code=404, detail="بیمه وسیله نقلیه پیدا نشد")

    await session.delete(vehicle_insurance)
    await session.commit()

    return {"msg": "بیمه وسیله نقلیه با موفقیت حذف شد"}

@router.get(
    "/vehicle_insurances/search/",
    response_model=list[RelationalVehicleInsurancePublic],
)
async def search_vehicle_insurances(
        *,
        session: AsyncSession = Depends(get_session),
        policy_number: str | None = None,
        insurance_type: InsuranceType | None = None,
        start_date: str | None = None,
        expiration_date: str | None = None,
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
    if policy_number:
        conditions.append(VehicleInsurance.policy_number == policy_number)
    if insurance_type:
        conditions.append(VehicleInsurance.insurance_type == insurance_type)
    if start_date:
        conditions.append(VehicleInsurance.start_date == start_date)
    if expiration_date:
        conditions.append(VehicleInsurance.expiration_date == expiration_date)

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    if operator == LogicalOperator.AND:
        query = select(VehicleInsurance).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(VehicleInsurance).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(VehicleInsurance).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)
    vehicle_insurance_db = await session.execute(query)
    vehicle_insurances = vehicle_insurance_db.scalars().all()
    if not vehicle_insurances:
        raise HTTPException(status_code=404, detail="بیمه وسیله نقلیه پیدا نشد")

    return vehicle_insurances
