from datetime import timedelta

from fastapi import APIRouter, Depends, Request, Response, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from dependencies import get_session
from schemas.authentication import LoginRequest
from utilities.authentication import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, \
    REFRESH_TOKEN_EXPIRE_MINUTES, decode_access_token

router = APIRouter()

@router.post("/refresh-token/")
async def refresh_token(request: Request,
                        response: Response) -> dict[str, str]:
    # Retrieve the refresh token from the cookie
    refresh_token_cookie = request.cookies.get("refresh_token")
    if not refresh_token_cookie:
        raise HTTPException(status_code=401, detail="Refresh token missing")


    # Decode and verify the refresh token (ensuring it is a refresh token)
    payload = decode_access_token(refresh_token_cookie)
    user_id = payload.get("id")
    role = payload.get("role")
    if not user_id or not role:
        raise HTTPException(status_code=401, detail="Invalid token data")

    # Issue a new access token (with token_type "access")
    new_access_token = create_access_token(data={"id": user_id, "role": role})
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=False,
        secure=True,
        samesite=None,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    # Rotate the refresh token: create a new refresh token
    new_refresh_token = create_access_token(
        data={"id": user_id, "role": role},
        expires_delta=timedelta(days=7)
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=False,
        secure=True,
        samesite=None,
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {"msg": "Access token refreshed"}


@router.post("/login/")
async def login(
    *,
    session: AsyncSession = Depends(get_session),
    response: Response,
    credentials: LoginRequest,
    request: Request
) -> dict[str, str]:
    """
    Endpoint for logging in a user. This route authenticates the user, generates access and refresh tokens,
    and returns them as HttpOnly cookies for secure authentication.
    """
    # Authenticate the user with the provided credentials
    user = await authenticate_user(credentials, session)

    # Create a payload containing the user's role and ID for the token
    token_payload = {"role": user["role"], "id": str(user["user"].id)}

    # Generate the access token with a short expiry time
    access_token = create_access_token(data=token_payload)

    # Set the access token as an HttpOnly, secure cookie with an expiration time
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=False,  # Prevents JavaScript access
        secure=True,  # Ensures the cookie is only sent over HTTPS
        samesite=None,  # Prevents CSRF by restricting cookie sending to same-site requests
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Token expiration duration in seconds
    )

    # Generate a refresh token with a longer expiry (7 days)
    refresh_access_token = create_access_token(data=token_payload, expires_delta=timedelta(days=7))

    # Set the refresh token as an HttpOnly, secure cookie with a longer expiration time
    response.set_cookie(
        key="refresh_token",
        value=refresh_access_token,
        httponly=False,
        secure=True,
        samesite=None,
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )


    # Return a success message after login
    return {"msg": "ورود موفقیت آمیز بود", "id": str(user["user"].id), "role": user["role"]}


@router.post("/logout/")
async def logout(request: Request, response: Response) -> dict[str, str]:
    # Delete the authentication cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("csrf_token")
    return {"msg": "خروج موفقیت آمیز بود"}
