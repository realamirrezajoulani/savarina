from fastapi import HTTPException
from pydantic import field_validator
from sqlalchemy import Column, BIGINT
from sqlmodel import Field, SQLModel

from utilities.fields_validator import validate_rental_start_date, validate_rental_end_date


class RentalBase(SQLModel):
    rental_start_date: str = Field(
        index=True,
    )

    rental_end_date: str = Field(
        index=True,
    )

    total_amount: int = Field(
        ge=1000,
        le=9999999999999,
        sa_column=Column(BIGINT)
    )

    @field_validator("rental_start_date")
    def rental_start_date_field(cls, value: str) -> str | HTTPException:
        return validate_rental_start_date(value)


    @field_validator("rental_end_date")
    def rental_end_date_field(cls, value: str) -> str | HTTPException:
        return validate_rental_end_date(value)


