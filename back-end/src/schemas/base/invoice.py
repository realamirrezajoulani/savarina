from sqlalchemy import Column, BIGINT
from sqlmodel import SQLModel, Field

from utilities.enumerables import InvoiceStatus


class InvoiceBase(SQLModel):
    total_amount: int = Field(
        ge=0,
        le=99999999999999,
        sa_column=Column(BIGINT)
    )

    tax: int = Field(
        ge=0,
        le=999999999,
    )

    discount: int = Field(
        ge=0,
        le=999999999,
    )

    final_amount: int = Field(
        ge=0,
        le=99999999999999,
        sa_column=Column(BIGINT)
    )

    status: InvoiceStatus = Field(
        index=True,
    )
