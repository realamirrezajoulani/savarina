from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Column, func
from sqlmodel import Relationship, Field

from schemas.base.admin import AdminBase
from schemas.base.comment import CommentBase
from schemas.base.customer import CustomerBase
from schemas.base.invoice import InvoiceBase
from schemas.base.payment import PaymentBase
from schemas.base.post import PostBase
from schemas.base.rental import RentalBase
from schemas.base.vehicle import VehicleBase
from schemas.base.vehicle_insurance import VehicleInsuranceBase


class Vehicle(VehicleBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )


    insurances: list["VehicleInsurance"] = Relationship(
        back_populates="vehicle",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    rentals: list["Rental"] = Relationship(
        back_populates="vehicle",
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class VehicleInsurance(VehicleInsuranceBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    vehicle_id: UUID = Field(foreign_key="vehicle.id", ondelete="CASCADE")
    vehicle: Vehicle = Relationship(
        back_populates="insurances",
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class Customer(CustomerBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    password: str

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    rentals: list["Rental"] = Relationship(
        back_populates="customer",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    comments: list["Comment"] = Relationship(
        back_populates="customer",
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class Invoice(InvoiceBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    rentals: list["Rental"] = Relationship(
        back_populates="invoice",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    payments: list["Payment"] = Relationship(
        back_populates="invoice",
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class Rental(RentalBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    customer_id: UUID = Field(foreign_key="customer.id", ondelete="CASCADE")
    customer: Customer = Relationship(
        back_populates="rentals",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    vehicle_id: UUID = Field(foreign_key="vehicle.id", ondelete="CASCADE")
    vehicle: Vehicle = Relationship(
        back_populates="rentals",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    invoice_id: UUID = Field(foreign_key="invoice.id", ondelete="CASCADE")
    invoice: Invoice = Relationship(
        back_populates="rentals",
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class Payment(PaymentBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    invoice_id: UUID = Field(foreign_key="invoice.id", ondelete="CASCADE")
    invoice: Invoice = Relationship(
        back_populates="payments",
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class Comment(CommentBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    customer_id: UUID = Field(foreign_key="customer.id", ondelete="CASCADE")
    customer: Customer = Relationship(
        back_populates="comments",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )


class Admin(AdminBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    password: str

    posts: list["Post"] = Relationship(
        back_populates="admin",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )


class Post(PostBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    admin_id: UUID = Field(foreign_key="admin.id", ondelete="CASCADE")
    admin: Admin = Relationship(
        back_populates="posts",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )


