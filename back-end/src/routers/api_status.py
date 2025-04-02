from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()


@router.head("/ping/")
async def ping() -> dict[str, str]:
    start_time = datetime.now(timezone.utc)
    response = {"msg": "This is good!"}
    end_time = datetime.now(timezone.utc)

    response_time = (end_time - start_time).total_seconds()

    if response_time < 1:
        response["response_time"] = f"{response_time * 1000:.2f} ms"
    else:
        response["response_time"] = f"{response_time:.4f} seconds"

    return response
