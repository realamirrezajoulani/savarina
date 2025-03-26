from jdatetime import datetime as jdatetime
from sqlalchemy import Column, BIGINT
from sqlmodel import SQLModel, Field

from utilities.enumerables import Brand, CarStatus, BranchLocations


class VehicleBase(SQLModel):
    plate_number: str = Field(
        min_length=10,
        max_length=12,
        unique=True,
        index=True,
        schema_extra={"pattern": r"^\d{2}([ب-ی]|الف)\d{3}-\d{2}$"},
    )

    location: BranchLocations = Field(
        ...
    )

    local_image_address: str = Field(
        min_length=5,
        max_length=50,
    )

    brand: Brand = Field(
        ...
    )

    model: str = Field(
        min_length=1,
        max_length=50,
    )

    year: int = Field(
        ge=1200,
        le=jdatetime.utcnow().year,
    )

    color: str = Field(
        min_length=2,
        max_length=30,
    )

    mileage: int = Field(
        ge=0,
        le=999999,
    )

    status: CarStatus = Field(
        index=True,
    )

    hourly_rental_rate: int = Field(
        ge=1000,
        le=9999999999,
        sa_column=Column(BIGINT)
    )

    security_deposit: int = Field(
        ge=1000,
        le=999999999999,
        sa_column=Column(BIGINT)
    )

