"""add api_key table

Revision ID: 6a41f534123a
Revises: 948534d28c61
Create Date: 2024-10-17 00:21:08.856899

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '6a41f534123a'
down_revision: Union[str, None] = '948534d28c61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('api_key',
    sa.Column('user', sa.Uuid(as_uuid=False), nullable=False),
    sa.Column('api_key', sa.String(), nullable=False),
    sa.Column('expiration', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user'], ['user.id'], ),
    sa.PrimaryKeyConstraint('api_key')
    )
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('identity_provider',
               existing_type=sa.VARCHAR(),
               nullable=False)
        batch_op.alter_column('family_name',
               existing_type=sa.VARCHAR(),
               nullable=False)
        batch_op.alter_column('given_name',
               existing_type=sa.VARCHAR(),
               nullable=False)

    with op.batch_alter_table('workflow', schema=None) as batch_op:
        batch_op.alter_column('schema',
               existing_type=sqlite.JSON(),
               nullable=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('workflow', schema=None) as batch_op:
        batch_op.alter_column('schema',
               existing_type=sqlite.JSON(),
               nullable=True)

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('given_name',
               existing_type=sa.VARCHAR(),
               nullable=True)
        batch_op.alter_column('family_name',
               existing_type=sa.VARCHAR(),
               nullable=True)
        batch_op.alter_column('identity_provider',
               existing_type=sa.VARCHAR(),
               nullable=True)

    op.drop_table('api_key')
    # ### end Alembic commands ###
