from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel, Field

from schemas.base.post import PostBase


class PostCreate(PostBase):
    admin_id: UUID


class PostPublic(PostBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class PostUpdate(SQLModel):
    thumbnail: str | None = Field(
        default=None,
        max_length=50
    )

    subject: str | None = Field(
        default=None,
        max_length=50,
    )

    content: str | None = Field(
        default=None,
        max_length=4096,
    )

