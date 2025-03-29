from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, not_

from dependencies import get_session, require_roles
from models.relational_models import Customer
from schemas.customer import CustomerCreate, CustomerUpdate
from schemas.relational_schemas import RelationalCustomerPublic
from utilities.authentication import get_password_hash, oauth2_scheme
from utilities.enumerables import LogicalOperator, Gender, AdminRole, CustomerRole

router = APIRouter()

@router.get(
    "/customers/",
    response_model=list[RelationalCustomerPublic] | RelationalCustomerPublic,
)
async def get_customers(
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
        customer = await session.get(Customer, _user["id"])

        return customer

    customers_query = select(Customer).offset(offset).limit(limit)
    customers = await session.execute(customers_query)

    customers_list = customers.scalars().all()

    return customers_list

@router.post(
    "/customers/",
    response_model=RelationalCustomerPublic,
)
async def create_customer(
        *,
        session: AsyncSession = Depends(get_session),
        customer_create: CustomerCreate,
):
    # Securely hash password before persistence
    hashed_password = get_password_hash(customer_create.password)

    try:

        db_customer = Customer(
            name_prefix=customer_create.name_prefix,
            first_name=customer_create.first_name,
            middle_name=customer_create.middle_name,
            last_name=customer_create.last_name,
            name_suffix=customer_create.name_suffix,
            gender=customer_create.gender,
            birthday=customer_create.birthday,
            national_id=customer_create.national_id,
            phone=customer_create.phone,
            username=customer_create.username,
            email=customer_create.email,
            address=customer_create.address,
            password=hashed_password,
        )


        # Persist to database with explicit transaction control
        session.add(db_customer)
        await session.commit()
        await session.refresh(db_customer)

        return db_customer

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=409,
            detail="نام کاربری یا پست الکترونیکی قبلا ثبت شده است"
        )
    except Exception as e:
        # Critical error handling with transaction rollback
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{e}خطا در ایجاد مشتری: "
        )

@router.get(
    "/customers/{customer_id}",
    response_model=RelationalCustomerPublic,
)
async def get_customer(
        *,
        session: AsyncSession = Depends(get_session),
        customer_id: UUID,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    """
    Retrieves the detailed information of a specific author, including their associated posts.

    This endpoint allows authenticated users with appropriate roles (FULL, ADMIN, or AUTHOR) to retrieve
    an author's public information and their posts by providing the author's unique ID.

    - **author_id**: The unique identifier of the author.
    """
    if _user["role"] == CustomerRole.CUSTOMER.value and customer_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای مشاهده اطلاعات مشتری های  دیگر را ندارید")

    # Attempt to retrieve the author record from the database
    customer = await session.get(Customer, customer_id)

    # If the author is found, process the data and add necessary links
    if not customer:
        raise HTTPException(status_code=404, detail="مشتری پیدا نشد")

    return customer



@router.patch(
    "/customers/{customer_id}",
    response_model=RelationalCustomerPublic,
)
async def patch_customer(
        *,
        session: AsyncSession = Depends(get_session),
        customer_id: UUID,
        customer_update: CustomerUpdate,
        _user: dict = Depends(
            require_roles(
                AdminRole.SUPER_ADMIN.value,
                AdminRole.GENERAL_ADMIN.value,
                CustomerRole.CUSTOMER.value,
            )
        ),
        _token: str = Depends(oauth2_scheme),
):
    # Check if the user is trying to delete themselves or is an admin/authorized full role.
    if _user["role"] == CustomerRole.CUSTOMER.value and customer_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای ویرایش اطلاعات مشتری های  دیگر را ندارید")

    # Retrieve the author record from the database using the provided ID.
    customer = await session.get(Customer, customer_id)

    if not customer:
        raise HTTPException(status_code=404, detail="مشتری پیدا نشد")

    # Prepare the update data, excluding unset fields.
    customer_data = customer_update.model_dump(exclude_unset=True)
    extra_data = {}

    # If the password is being updated, hash it before saving.
    if "password" in customer_data.keys():
        password = customer_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["password"] = hashed_password

    # Apply the update to the author record.
    customer.sqlmodel_update(customer_data, update=extra_data)

    # Commit the transaction and refresh the instance to reflect the changes.
    session.add(customer)
    await session.commit()
    await session.refresh(customer)

    return customer


@router.delete(
    "/customers/{customer_id}",
    response_model=RelationalCustomerPublic,
)
async def delete_customer(
    *,
    session: AsyncSession = Depends(get_session),
    customer_id: UUID,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
            AdminRole.GENERAL_ADMIN.value,
            CustomerRole.CUSTOMER.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    # Check if the user is trying to delete themselves or is an admin/authorized full role.
    if _user["role"] == CustomerRole.CUSTOMER.value and customer_id != UUID(_user["id"]):
        raise HTTPException(status_code=403,
                            detail="شما دسترسی لازم برای حذف مشتری های  دیگر را ندارید")

    # Fetch the author record from the database using the provided ID.
    customer = await session.get(Customer, customer_id)

    # If the author is not found, raise a 404 Not Found error.
    if not customer:
        raise HTTPException(status_code=404, detail="مشتری پیدا نشد")

    customer_data = RelationalCustomerPublic.model_validate(customer)

    # Proceed to delete the author if the above conditions are met.
    await session.delete(customer)
    await session.commit()  # Commit the transaction to apply the changes

    # Return the author information after deletion.
    return customer_data

@router.get(
    "/customers/search/",
    response_model=list[RelationalCustomerPublic],
)
async def search_customers(
        *,
        session: AsyncSession = Depends(get_session),
        last_name: str | None = None,
        gender: Gender | None = None,
        national_id: str | None = None,
        phone: int | None = None,
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

    conditions = []  # Initialize the list of filter conditions

    # Start building the query to fetch authors with pagination.
    query = select(Customer).offset(offset).limit(limit)

    # Add filters to the conditions list if the corresponding arguments are provided.
    if last_name:
        conditions.append(Customer.last_name.ilike(f"%{last_name}%"))
    if national_id:
        conditions.append(Customer.national_id == national_id)
    if phone:
        conditions.append(Customer.phone == phone)
    if gender:
        conditions.append(Customer.gender == gender)

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
    customer_db = await session.execute(query)
    customers = customer_db.scalars().all()  # Retrieve all authors that match the conditions

    # If no authors are found, raise a "not found" error.
    if not customers:
        raise HTTPException(status_code=404, detail="مشتری پیدا نشد")

    return customers


