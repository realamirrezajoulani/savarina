from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import EmailStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Admin
from schemas.admin import AdminCreate, AdminUpdate
from schemas.relational_schemas import RelationalAdminPublic
from utilities.authentication import get_password_hash, oauth2_scheme
from utilities.enumerables import LogicalOperator, AdminRole, AdminStatus

router = APIRouter()


@router.get(
    "/admins/",
    response_model=list[RelationalAdminPublic] | RelationalAdminPublic,
)
async def get_admins(
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
    if _user["role"] == AdminRole.GENERAL_ADMIN.value:
        return await session.get(Admin, _user["id"])

    admins_query = select(Admin).offset(offset).limit(limit)
    admins = await session.execute(admins_query)
    return admins.scalars().all()


@router.post(
    "/admins/",
    response_model=RelationalAdminPublic,
)
async def create_admin(
        *,
        session: AsyncSession = Depends(get_session),
        admin_create: AdminCreate,
        # _user: dict = Depends(
        #     require_roles(
        #         AdminRole.SUPER_ADMIN.value,
        #         AdminRole.GENERAL_ADMIN.value,
        #     )
        # ),
        # _token: str = Depends(oauth2_scheme),
):
    # final_role = AdminRole.GENERAL_ADMIN.value if _user["role"] == AdminRole.GENERAL_ADMIN.value else admin_create.role

    hashed_password = get_password_hash(admin_create.password)

    try:
        db_admin = Admin(
            name_prefix=admin_create.name_prefix,
            first_name=admin_create.first_name,
            middle_name=admin_create.middle_name,
            last_name=admin_create.last_name,
            name_suffix=admin_create.name_suffix,
            national_id=admin_create.national_id,
            gender=admin_create.gender,
            birthday=admin_create.birthday,
            phone=admin_create.phone,
            address=admin_create.address,
            username=admin_create.username,
            email=admin_create.email,
            role=admin_create.role,
            status=admin_create.status,
            password=hashed_password,
        )

        session.add(db_admin)
        await session.commit()
        await session.refresh(db_admin)

        return db_admin

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=409,
            detail="نام کاربری یا پست الکترونیکی یا کد ملی قبلا ثبت شده است"
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد ادمین: "
        )


@router.get(
    "/admins/{admin_id}",
    response_model=RelationalAdminPublic,
)
async def get_admin(
        *,
        session: AsyncSession = Depends(get_session),
        admin_id: UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    if _user["role"] == AdminRole.GENERAL_ADMIN.value and admin_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای مشاهده اطلاعات ادمین های  دیگر را ندارید")

    admin = await session.get(Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین پیدا نشد")

    return admin


@router.patch(
    "/admins/{admin_id}",
    response_model=RelationalAdminPublic,
)
async def patch_admin(
        *,
        session: AsyncSession = Depends(get_session),
        admin_id: UUID,
        admin_update: AdminUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):

    if _user["role"] == AdminRole.GENERAL_ADMIN.value and admin_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات ادمین های  دیگر را ندارید")

    admin = await session.get(Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین پیدا نشد")

    update_data = admin_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password"] = get_password_hash(update_data["password"])

    admin.sqlmodel_update(update_data)

    await session.commit()
    await session.refresh(admin)

    return admin


@router.delete(
    "/admins/{admin_id}",
    response_model=dict[str, str],
)
async def delete_admin(
    *,
    session: AsyncSession = Depends(get_session),
    admin_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    if _user["role"] == AdminRole.GENERAL_ADMIN.value and admin_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای حذف ادمین های  دیگر را ندارید")

    admin = await session.get(Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین پیدا نشد")

    await session.delete(admin)
    await session.commit()

    return {"msg": "ادمین با موفقیت حذف شد"}


@router.get(
    "/admins/search/",
    response_model=list[RelationalAdminPublic],
)
async def search_admins(
        *,
        session: AsyncSession = Depends(get_session),
        username: str | None = None,
        email: EmailStr | None = None,
        role: AdminRole | None = None,
        status: AdminStatus | None = None,
        national_id: str | None = None,
        gender: str | None = None,
        phone: int | None = None,
        operator: LogicalOperator,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=100, le=100),
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    conditions = []
    if username:
        conditions.append(Admin.username.ilike(f"%{username}%"))
    if email:
        conditions.append(Admin.email == email)
    if role:
        conditions.append(Admin.role == role)
    if status:
        conditions.append(Admin.status == status)
    if national_id:
        conditions.append(Admin.national_id == national_id)
    if gender:
        conditions.append(Admin.gender == gender)
    if phone:
        conditions.append(Admin.phone == phone)

    if not conditions:
        raise HTTPException(status_code=400, detail="هیچ مقداری برای جست و جو وجود ندارد")

    if operator == LogicalOperator.AND:
        query = select(Admin).where(and_(*conditions))
    elif operator == LogicalOperator.OR:
        query = select(Admin).where(or_(*conditions))
    elif operator == LogicalOperator.NOT:
        query = select(Admin).where(and_(not_(*conditions)))
    else:
        raise HTTPException(status_code=400, detail="عملگر نامعتبر مشخص شده است")

    query = query.offset(offset).limit(limit)
    result = await session.execute(query)
    admins = result.scalars().all()
    if not admins:
        raise HTTPException(status_code=404, detail="مشتری پیدا نشد")

    return admins
