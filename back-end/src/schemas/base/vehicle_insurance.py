from fastapi import HTTPException
from pydantic import field_validator
from sqlalchemy import Column, BIGINT
from sqlmodel import SQLModel, Field

from utilities.enumerables import InsuranceType
from utilities.fields_validator import validate_insurance_expiration_date, \
    validate_insurance_start_date


class VehicleInsuranceBase(SQLModel):
    insurance_company: str = Field(
        min_length=2,
        max_length=100,
    )

    insurance_type: InsuranceType = Field(
        ...
    )

    policy_number: str = Field(
        min_length=10,
        max_length=30,
        schema_extra={"pattern": r"^\d+(?:\/\d+){2,5}$"},
        unique=True,
        index=True,
    )

    start_date: str = Field(
        index = True,
    )

    expiration_date: str = Field(
        index = True,
    )

    premium: int = Field(
        ge=0,
        le=999999999999,
        sa_column=Column(BIGINT),
    )

    @field_validator("start_date")
    def validate_start_date(cls, value: str) -> str | HTTPException:
        return validate_insurance_start_date(value)

    @field_validator("expiration_date")
    def validate_end_date(cls, value: str) -> str | HTTPException:
        return validate_insurance_expiration_date(value)
