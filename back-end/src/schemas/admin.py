from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from pydantic import field_validator, EmailStr
from sqlmodel import Field, SQLModel

from schemas.base.admin import AdminBase
from utilities.enumerables import AdminRole, AdminStatus, Gender
from utilities.fields_validator import validate_password_value, validate_birthday


class AdminCreate(AdminBase):
    password: str = Field(
        ...
    )

    @field_validator("password")
    def validate_password(cls, value: str) -> str | HTTPException:
        return validate_password_value(value)


class AdminPublic(AdminBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class AdminUpdate(SQLModel):
    name_prefix: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
        schema_extra={"pattern": r"^(?:[ا-ی]+|[a-z]+)$"},
    )

    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        schema_extra={"pattern": r"^(?:[ا-ی]+|[a-z]+)$"},
    )

    middle_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
        schema_extra={"pattern": r"^(?:[ا-ی]+|[a-z]+)$"},
    )

    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        schema_extra={"pattern": r"^(?:[ا-ی]+|[a-z]+)$"},
    )

    name_suffix: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
        schema_extra={"pattern": r"^(?:[ا-ی]+|[a-z]+)$"},
    )

    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=30,
        schema_extra={"pattern": r"^[a-z]+[a-z0-9._]+[a-z]+$"},
        unique=True,
        index=True,
    )

    email: EmailStr | None = Field(
        default=None,
        unique=True,
        index=True,
    )

    role: AdminRole | None = Field(
        default=None,
    )

    status: AdminStatus | None = Field(
        default=None,
    )

    national_id: str | None = Field(
        default=None,
        min_length=10,
        max_length=10,
        schema_extra={"pattern": r"^\d{10}$"},
        index=True,
        unique=True,
    )

    gender: Gender | None = Field(
        default=None,
    )

    birthday: str | None = Field(
        default=None,
    )

    phone: int | None = Field(
        default=None,
        ge=9000000000,
        le=9999999999,
    )

    address: str | None = Field(
        default=None,
        max_length=255,
    )

    password: str | None = Field(
        default=None,
    )

    @field_validator("password")
    def validate_password(cls, value: str) -> str | HTTPException:
        return validate_password_value(value)

    @field_validator("name_prefix",
                     "first_name",
                     "middle_name",
                     "last_name",
                     "name_suffix",
                     "national_id",
                     "address")
    def trim_whitespace(cls, value: str) -> str:
        return value.strip() if value else value

    @field_validator("birthday")
    def validate_birthday(cls, value: str) -> str | HTTPException:
        return validate_birthday(value)

