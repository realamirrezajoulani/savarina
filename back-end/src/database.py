from contextlib import asynccontextmanager
from os import getenv

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel

# Importing models to identify them in SQLModel metadata
from models import relational_models, branch, fines_damage, system_log, system_setting, vehicle_maintenance


# Retrieve the database URL from environment variables
POSTGRESQL_URL = getenv("POSTGRESQL_URL")

# Create an asynchronous SQLAlchemy engine with logging enabled
async_engine = create_async_engine(POSTGRESQL_URL)


async def create_tables():
    """
    Asynchronously create database tables based on SQLModel metadata.
    Ensures that all defined models are reflected in the database.
    """
    async with async_engine.begin() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)


# Async context manager to handle lifespan of the application
@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Lifespan context manager that is used to manage the initialization and cleanup tasks
    during the startup and shutdown of the FastAPI application.
    """

    # redis = await aioredis.from_url("redis://localhost:6379")
    # FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

    # Initialize the database tables before starting the application
    await create_tables()

    # Yield control back to the FastAPI app to continue running
    yield

    # Cleanup and dispose of the database engine after the application shuts down
    await async_engine.dispose()

