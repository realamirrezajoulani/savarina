from typing import AsyncGenerator, Any, Callable

import jwt
from fastapi import HTTPException, Request, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from database import async_engine
from utilities.authentication import decode_access_token


def require_roles(*required_roles: str) -> Callable:
    async def dependency(_user: dict = Depends(get_current_user)) -> dict:
        if _user["role"] not in required_roles:
            allowed_roles = ", ".join(required_roles)
            raise HTTPException(
                status_code=403,
                detail=f"دسترسی به یکی از نقش های زیر نیاز دارد: {allowed_roles}"
            )
        return _user

    return dependency

def get_current_user(request: Request) -> dict[str, Any]:

    # Retrieve the access token from cookies
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="احراز هویت نشده است"
        )

    # Remove 'Bearer ' prefix if present
    token = token.removeprefix("Bearer ")

    try:
        # Decode the token to extract user information
        payload = decode_access_token(token)

        # Ensure the role exists in the payload
        role = payload.get("role")
        if not role:
            raise HTTPException(
                status_code=403,
                detail="نقش پیدا نشد"
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="توکن منقضی شده است"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="توکن نامعتبر است"
        )

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"احراز هویت ناموفق بود: {str(e)}"
        )

    return payload

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Asynchronous dependency to provide a database session.

    This function creates and manages an asynchronous database session using SQLAlchemy's AsyncSession.
    It ensures proper session handling, including cleanup after use.

    Yields:
        AsyncSession: A database session that can be used for queries.

    Example:
        async with get_session() as session:
            result = await session.execute(statement)
            data = result.scalars().all()

    Raises:
        Exception: If session creation fails (unlikely, but can be handled for logging).
    """
    async with AsyncSession(async_engine) as session:
        yield session  # Provide the session to the caller
