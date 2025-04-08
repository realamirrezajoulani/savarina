from datetime import datetime
from jdatetime import datetime as jdatetime
from uuid import UUID

from sqlmodel import Field, SQLModel

from schemas.base.vehicle import VehicleBase
from utilities.enumerables import Brand, CarStatus, BranchLocations


class VehicleCreate(VehicleBase):
    pass


class VehiclePublic(VehicleBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class VehicleUpdate(SQLModel):
    plate_number: str | None = Field(
        default=None,
        min_length=8,
        max_length=12,
        unique=True,
        index=True,
        schema_extra={"pattern": r"^\d{2}([ب-ی]|الف)\d{3}-\d{2}$"},
    )

    brand: Brand | None = Field(
        default=None,
    )

    model: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    year: int | None = Field(
        default=None,
        ge=1200,
        le=jdatetime.utcnow().year,
    )

    color: str | None = Field(
        default=None,
        min_length=2,
        max_length=30,
    )

    mileage: int | None = Field(
        default=None,
        ge=0,
        le=999999,
    )

    status: CarStatus | None = Field(
        default=None,
        index=True,
    )

    hourly_rental_rate: int | None = Field(
        default=None,
        ge=1000,
        le=9999999999,
    )

    security_deposit: int | None = Field(
        default=None,
        ge=1000,
        le=999999999999,
    )

    location: BranchLocations | None = Field(
        default=None,
    )

    local_image_address: str | None = Field(
        default=None,
        min_length=5,
        max_length=50,
    )