from datetime import datetime, timezone

import asyncpg
from fastapi import APIRouter

from database import POSTGRESQL_URL

router = APIRouter()


@router.head("/database/ping/")
async def ping() -> dict[str, str]:
    start_time = datetime.now(timezone.utc)

    conn = await asyncpg.connect(POSTGRESQL_URL)
    result = await conn.fetchval("SELECT 1;")
    await conn.close()
    response = {"msg": result}

    end_time = datetime.now(timezone.utc)

    response_time = (end_time - start_time).total_seconds()

    if response_time < 1:
        response["response_time"] = f"{response_time * 1000:.2f} ms"
    else:
        response["response_time"] = f"{response_time:.4f} seconds"

    return response
