from sqlalchemy import Column, DateTime, MetaData, Numeric, String, Table, Text
from ..database import Base

metadata = Base.metadata

t_transaction_info = Table(
    'transaction_info', metadata,
    Column('user_id', String, nullable=False),
    Column('product_name', Text, nullable=False),
    Column('date_time', DateTime(True), nullable=False),
    Column('product_price', Numeric, nullable=False),
    schema='Transactions'
)
