from fastapi import HTTPException
from pydantic import field_validator
from sqlalchemy import Column, BIGINT
from sqlmodel import SQLModel, Field

from utilities.enumerables import PaymentMethod, PaymentStatus
from utilities.fields_validator import validate_payment_datetime


class PaymentBase(SQLModel):
    payment_datetime: str = Field(
        index=True,
    )

    payment_method: PaymentMethod = Field(
        ...
    )

    transaction_id: str | None = Field(
        default=None,
        unique=True,
    )

    amount: int = Field(
        ge=1000,
        le=99999999999999,
        sa_column=Column(BIGINT)
    )

    payment_status: PaymentStatus = Field(
        index=True,
    )

    @field_validator("payment_datetime")
    def validate_payment_datetime(cls, value: str) -> str | HTTPException:
        return validate_payment_datetime(value)
