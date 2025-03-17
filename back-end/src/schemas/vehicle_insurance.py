from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from pydantic import field_validator
from sqlmodel import SQLModel, Field

from schemas.base.vehicle_insurance import VehicleInsuranceBase
from utilities.enumerables import InsuranceType
from utilities.fields_validator import validate_insurance_start_date, validate_insurance_expiration_date


class VehicleInsuranceCreate(VehicleInsuranceBase):
    vehicle_id: UUID


class VehicleInsurancePublic(VehicleInsuranceBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class VehicleInsuranceUpdate(SQLModel):
    insurance_company: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    insurance_type: InsuranceType | None = Field(
        default=None,
    )

    policy_number: str = Field(
        default=None,
        min_length=10,
        max_length=30,
        schema_extra={"pattern": r"^\d+(?:\/\d+){2,5}$"},
        unique=True,
        index=True,
    )

    start_date: str | None = Field(
        default=None,
    )

    expiration_date: str | None = Field(
        default=None,
    )

    premium: int | None = Field(
        default=None,
        ge=0,
        le=999999999999
    )

    @field_validator("start_date")
    def validate_start_date(cls, value: str) -> str | HTTPException:
        return validate_insurance_start_date(value)

    @field_validator("expiration_date")
    def validate_end_date(cls, value: str) -> str | HTTPException:
        return validate_insurance_expiration_date(value)
