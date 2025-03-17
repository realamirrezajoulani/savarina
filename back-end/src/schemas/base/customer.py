from fastapi import HTTPException
from pydantic import EmailStr, field_validator
from sqlalchemy import Column, BIGINT
from sqlmodel import SQLModel, Field

from utilities.enumerables import Gender
from utilities.fields_validator import validate_birthday


class CustomerBase(SQLModel):
    name_prefix: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
        schema_extra={"pattern": r"^(?:[ا-ی]+|[a-z]+)$"},
    )

    first_name: str = Field(
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

    last_name: str = Field(
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

    gender: Gender = Field(
        ...
    )

    birthday: str = Field(
        ...
    )

    national_id: str = Field(
        min_length=10,
        max_length=10,
        schema_extra={"pattern": r"^\d{10}$"},
        index=True,
        unique=True,
    )

    phone: int = Field(
        ge=9000000000,
        le=9999999999,
        sa_column=Column(BIGINT),
    )

    username: str = Field(
        min_length=3,
        max_length=30,
        schema_extra={"pattern": r"^[a-z]+[a-z0-9._]+[a-z]+$"},
        unique=True,
        index=True,
    )

    email: EmailStr | None = Field(
        unique=True,
    )

    address: str = Field(
        max_length=255,
    )


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
