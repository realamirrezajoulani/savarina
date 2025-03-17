from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from pydantic import field_validator
from sqlmodel import Field, SQLModel

from schemas.base.rental import RentalBase
from utilities.enumerables import BranchLocations
from utilities.fields_validator import validate_rental_start_date, \
    validate_rental_end_date


class RentalCreate(RentalBase):
    customer_id: UUID
    vehicle_id: UUID
    invoice_id: UUID


class RentalPublic(RentalBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class RentalUpdate(SQLModel):
    rental_start_date: str | None = Field(
        default=None
    )

    rental_end_date: str | None  = Field(
        default=None
    )

    pickup_location: BranchLocations | None = Field(
        default=None
    )

    return_location: BranchLocations | None = Field(
        default=None
    )

    total_amount: int | None = Field(
        default=None,
        ge=1000,
        le=9999999999999,
    )

    @field_validator("rental_start_date")
    def rental_start_date_field(cls, value: str) -> str | HTTPException:
        return validate_rental_start_date(value)


    @field_validator("rental_end_date")
    def rental_end_date_field(cls, value: str) -> str | HTTPException:
        return validate_rental_end_date(value)
