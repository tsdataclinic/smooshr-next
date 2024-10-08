"""Change user and workflow ids to be UUIDs

Revision ID: 948534d28c61
Revises: d7549bdf8f37
Create Date: 2024-08-23 17:27:30.679868

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '948534d28c61'
down_revision: Union[str, None] = 'd7549bdf8f37'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.VARCHAR(),
               type_=sa.Uuid(as_uuid=False),
               existing_nullable=False)

    with op.batch_alter_table('workflow', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.INTEGER(),
               type_=sa.Uuid(as_uuid=False),
               existing_nullable=False)
        batch_op.alter_column('owner',
               existing_type=sa.INTEGER(),
               type_=sa.Uuid(as_uuid=False),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('workflow', schema=None) as batch_op:
        batch_op.alter_column('owner',
               existing_type=sa.Uuid(as_uuid=False),
               type_=sa.INTEGER(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.Uuid(as_uuid=False),
               type_=sa.INTEGER(),
               existing_nullable=False)

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.Uuid(as_uuid=False),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # ### end Alembic commands ###
