from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel, Field

from schemas.base.invoice import InvoiceBase
from utilities.enumerables import InvoiceStatus


class InvoiceCreate(InvoiceBase):
    pass


class InvoicePublic(InvoiceBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class InvoiceUpdate(SQLModel):
    total_amount: int | None = Field(
        default=None,
        ge=1000,
        le=99999999999999,
    )

    tax: int | None = Field(
        default=None,
        ge=1000,
        le=999999999,
    )

    discount: int | None = Field(
        default=None,
        ge=1000,
        le=999999999,
    )

    final_amount: int | None = Field(
        default=None,
        ge=1000,
        le=99999999999999,
    )

    status: InvoiceStatus | None = Field(
        default=None,
    )