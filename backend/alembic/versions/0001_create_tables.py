"""create doctors and appointments

Revision ID: 0001_create_tables
Revises:
Create Date: 2026-10-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_create_tables"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "doctors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("specialty", sa.String(length=100), nullable=False),
        sa.Column("room", sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_name", sa.String(length=100), nullable=False),
        sa.Column("doctor_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time", sa.Time(), nullable=False),
        sa.Column("reason", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(["doctor_id"], ["doctors.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("doctor_id", "date", "time", name="uix_doctor_slot"),
    )


def downgrade() -> None:
    op.drop_table("appointments")
    op.drop_table("doctors")
