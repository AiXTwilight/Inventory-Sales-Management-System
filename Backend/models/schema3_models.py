import datetime
import decimal
from sqlalchemy import DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base

class TransactionInfo(Base):
    __tablename__ = 'transaction_info'
    __table_args__ = {'schema': 'Transactions'}

    user_id: Mapped[str] = mapped_column(String, nullable=False)
    product_name: Mapped[str] = mapped_column(Text, nullable=False)
    date_time: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False)
    product_price: Mapped[decimal.Decimal] = mapped_column(Numeric, nullable=False)
