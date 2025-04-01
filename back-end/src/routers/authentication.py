from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel.ext.asyncio.session import AsyncSession

from dependencies import get_session
from schemas.authentication import LoginRequest
from utilities.authentication import authenticate_user, create_access_token, decode_access_token, \
    ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES

router = APIRouter()


@router.post("/refresh-token/")
async def refresh_token(request: Request) -> dict[str, str]:
    auth_header = request.headers.get("Authorization-Refresh")
    if not auth_header:
        raise HTTPException(status_code=401, detail="توکن refresh در هدر یافت نشد")

    refresh_token_value = auth_header.removeprefix("Bearer ").strip()
    if not refresh_token_value:
        raise HTTPException(status_code=401, detail="توکن refresh معتبر نیست")

    payload = decode_access_token(refresh_token_value)
    user_id = payload.get("id")
    role = payload.get("role")
    if not user_id or not role:
        raise HTTPException(status_code=401, detail="اطلاعات توکن نامعتبر است")

    new_access_token = create_access_token(
        data={"id": user_id, "role": role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    new_refresh_token = create_access_token(
        data={"id": user_id, "role": role},
        expires_delta=timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "msg": "توکن دسترسی به‌روزرسانی شد",
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }


@router.post("/login/")
async def login(
    *,
    session: AsyncSession = Depends(get_session),
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> dict[str, str]:
    credentials = LoginRequest(username=form_data.username, password=form_data.password)

    user = await authenticate_user(credentials, session)

    token_payload = {"role": user["role"], "id": str(user["user"].id)}

    access_token = create_access_token(
        data=token_payload,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    refresh_access_token = create_access_token(
        data=token_payload,
        expires_delta=timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "msg": "ورود موفقیت‌آمیز بود",
        "id": str(user["user"].id),
        "role": user["role"],
        "access_token": access_token,
        "refresh_token": refresh_access_token
    }
