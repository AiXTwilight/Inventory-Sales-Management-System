import datetime

from sqlalchemy import ARRAY, DateTime, PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base

class AdminInfo(Base):
    __tablename__ = 'admin_info'
    __table_args__ = (
        PrimaryKeyConstraint('admin_id', name='admin_info_pkey'),
        {'schema': 'Admins'}
    )

    admin_id: Mapped[str] = mapped_column(String(5), primary_key=True)
    admin_email: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[list[str]] = mapped_column(ARRAY(String(length=255)), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False)
