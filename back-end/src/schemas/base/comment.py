from sqlmodel import SQLModel, Field

from utilities.enumerables import CommentSubject, CommentStatus


class CommentBase(SQLModel):
    subject: CommentSubject = Field(
        index=True,
    )

    content: str = Field(
        max_length=1024,
    )

    status: CommentStatus = Field(
        index=True,
    )
