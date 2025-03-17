import os
from datetime import timedelta, timezone, datetime
from typing import Any

import jwt
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from models.relational_models import Admin, Customer
from schemas.authentication import LoginRequest
from utilities.enumerables import AdminRole, CustomerRole

ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Access token lifetime (15 minutes)
REFRESH_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60  # Refresh token lifetime (7 days)

SECRET_KEY = os.getenv("CRMS_SECURITY_KEY")

ALGORITHM = "HS512"

# Password hashing context using PBKDF2-HMAC-SHA512
pwd_context = CryptContext(schemes=["pbkdf2_sha512"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:

    # Create a copy of the input data to avoid mutating the original object
    to_encode = data.copy()

    # Calculate the expiration time by adding the expiration delta (if provided)
    # to the current time, otherwise use the default expiration time.
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    # Add the expiration time to the data to be encoded
    to_encode.update({"exp": expire})

    # Encode the JWT using the secret key and specified algorithm
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Error decoding JWT: {e}"
        )


def get_password_hash(password: str) -> str:
    """
    Hashes the provided password using the bcrypt algorithm.

    Args:
        password (str): The plain password to be hashed.

    Returns:
        str: The hashed version of the provided password.

    This function hashes the provided password using the `hash` method from
    passlib's CryptContext. It's commonly used for securely storing passwords.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies whether the provided plain password matches the hashed password.

    Args:
        plain_password (str): The password in plain text to be verified.
        hashed_password (str): The hashed version of the password to compare against.

    Returns:
        bool: True if the plain password matches the hashed password, otherwise False.

    This function uses the `verify` method from passlib's CryptContext to compare
    the plain password with the stored hashed password. It handles exceptions gracefully
    and ensures the function always returns a boolean result.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        # Log the exception or handle the error in a more meaningful way
        return False


async def authenticate_user(credentials: LoginRequest, session: AsyncSession):
    username = credentials.username
    password = credentials.password
    role = credentials.role

    if role in (AdminRole.GENERAL_ADMIN.value, AdminRole.SUPER_ADMIN.value):
        query = select(Admin).where(Admin.username == username).where(Admin.role == role)
        result = await session.execute(query)
        admin_user = result.scalars().one_or_none()

        if not admin_user or not verify_password(password, admin_user.password):
            raise HTTPException(
                status_code=401,
                detail="نام کاربری یا گذرواژه پیدا نشد",
            )
        return admin_user

    elif role == CustomerRole.CUSTOMER.value:
        query = select(Customer).where(Customer.username == username)
        result = await session.execute(query)
        customer_user = result.scalars().one_or_none()

        if not customer_user or not verify_password(password, customer_user.password):
            raise HTTPException(
                status_code=401,
                detail="نام کاربری یا گذرواژه پیدا نشد",
            )
        return customer_user

    else:
        raise HTTPException(
            status_code=400,
            detail="نقش نادرست است"
        )