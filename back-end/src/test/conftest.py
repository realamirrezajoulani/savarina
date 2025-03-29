import uuid
from datetime import timedelta

from httpx import AsyncClient, ASGITransport
import pytest_asyncio
from config import app
from utilities.authentication import create_access_token


@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

@pytest_asyncio.fixture
async def fake_admin_token():
    admin_id = str(uuid.uuid4())
    token = create_access_token(data={"id": admin_id, "role": "SuperAdmin"}, expires_delta=timedelta(minutes=60))
    return token
