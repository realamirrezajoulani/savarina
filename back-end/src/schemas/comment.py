from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel, Field

from schemas.base.comment import CommentBase
from utilities.enumerables import CommentSubject, CommentStatus


class CommentCreate(CommentBase):
    customer_id: UUID


class CommentPublic(CommentBase):
    created_at: datetime
    updated_at: datetime | None
    id: UUID


class CommentUpdate(SQLModel):
    subject: CommentSubject | None = Field(
        default=None,
        index=True,
    )

    content: str | None = Field(
        default=None,
        max_length=1024,
    )

    status: CommentStatus | None = Field(
        default=None,
        index=True,
    )
