from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class SalesTransaction(Base):
    __tablename__ = "sales_transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    customer_name = Column(String, index=True)
    amount = Column(Float)
    currency = Column(String)
    converted_amount_usd = Column(Float)
    sales_rep = Column(String, index=True)
    region = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
