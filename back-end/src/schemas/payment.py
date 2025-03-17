from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from pydantic import field_validator
from sqlmodel import SQLModel, Field

from schemas.base.payment import PaymentBase
from utilities.enumerables import PaymentMethod, PaymentStatus
from utilities.fields_validator import validate_payment_datetime


class PaymentCreate(PaymentBase):
    invoice_id: UUID


class PaymentPublic(PaymentBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class PaymentUpdate(SQLModel):
    payment_datetime: str | None = Field(
        default=None,
    )

    payment_method: PaymentMethod | None = Field(
        default=None,
    )

    transaction_id: str | None = Field(
        default=None,
        unique=True,
    )

    amount: int | None = Field(
        default=None,
        ge=1000,
        le=99999999999999,
    )

    payment_status: PaymentStatus | None = Field(
        default=None,
    )

    @field_validator("payment_datetime")
    def validate_payment_datetime(cls, value: str) -> str | HTTPException:
        return validate_payment_datetime(value)
