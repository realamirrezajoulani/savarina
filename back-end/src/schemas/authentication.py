from fastapi import HTTPException
from pydantic import field_validator
from sqlmodel import SQLModel, Field

from utilities.fields_validator import validate_password_value

from utilities.enumerables import AdminRole, CustomerRole


class LoginRequest(SQLModel):
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=30,
        schema_extra={"pattern": r"^[a-z]+[a-z0-9._]+[a-z]+$"},
    )

    password: str = Field(
        ...
    )

    role: AdminRole | CustomerRole = Field(
        ...
    )

    @field_validator("password")
    def validate_password(cls, value: str) -> str | HTTPException:
        # Validate the password using the external validation function
        return validate_password_value(value)
