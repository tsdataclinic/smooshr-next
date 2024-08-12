"""Autoincrement workflow ID

Revision ID: 4e06e9cdcc64
Revises: 37b902064c28
Create Date: 2024-08-11 20:58:52.441829

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e06e9cdcc64'
down_revision: Union[str, None] = '37b902064c28'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    with op.batch_alter_table('workflows') as batch_op:
        batch_op.alter_column('id', existing_type=sa.Integer, autoincrement=True)

def downgrade():
    with op.batch_alter_table('workflows') as batch_op:
        batch_op.alter_column('id', existing_type=sa.Integer, autoincrement=False)
