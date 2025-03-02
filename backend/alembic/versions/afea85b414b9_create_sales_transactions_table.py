"""Create sales transactions table

Revision ID: afea85b414b9
Revises: 
Create Date: 2025-03-01 17:46:45.324206

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'afea85b414b9'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('sales_transactions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=True),
    sa.Column('customer_name', sa.String(), nullable=True),
    sa.Column('amount', sa.Float(), nullable=True),
    sa.Column('currency', sa.String(), nullable=True),
    sa.Column('converted_amount_usd', sa.Float(), nullable=True),
    sa.Column('sales_rep', sa.String(), nullable=True),
    sa.Column('region', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sales_transactions_customer_name'), 'sales_transactions', ['customer_name'], unique=False)
    op.create_index(op.f('ix_sales_transactions_date'), 'sales_transactions', ['date'], unique=False)
    op.create_index(op.f('ix_sales_transactions_id'), 'sales_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_sales_transactions_region'), 'sales_transactions', ['region'], unique=False)
    op.create_index(op.f('ix_sales_transactions_sales_rep'), 'sales_transactions', ['sales_rep'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_sales_transactions_sales_rep'), table_name='sales_transactions')
    op.drop_index(op.f('ix_sales_transactions_region'), table_name='sales_transactions')
    op.drop_index(op.f('ix_sales_transactions_id'), table_name='sales_transactions')
    op.drop_index(op.f('ix_sales_transactions_date'), table_name='sales_transactions')
    op.drop_index(op.f('ix_sales_transactions_customer_name'), table_name='sales_transactions')
    op.drop_table('sales_transactions')
    # ### end Alembic commands ###
