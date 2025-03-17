from datetime import datetime
from jdatetime import datetime as jdatetime
from uuid import UUID

from sqlmodel import Field, SQLModel

from schemas.base.vehicle import VehicleBase
from utilities.enumerables import Brand, CarColor, CarStatus, BranchLocations


class VehicleCreate(VehicleBase):
    pass


class VehiclePublic(VehicleBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class VehicleUpdate(SQLModel):
    plate_number: str | None = Field(
        default=None,
        min_length=10,
        max_length=10,
        unique=True,
        index=True,
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

    color: CarColor | None = Field(
        default=None,
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