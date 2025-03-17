from sqlmodel import SQLModel, Field


class PostBase(SQLModel):
    thumbnail: str | None = Field(
        default=None,
        max_length=50
    )

    subject: str = Field(
        max_length=50,
    )

    content: str = Field(
        max_length=4096,
    )

