from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class SalesTransactionBase(BaseModel):
    customer_name: str
    amount: float
    currency: str
    sales_rep: str
    region: str

class SalesTransactionCreate(SalesTransactionBase):
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)

class SalesTransaction(SalesTransactionBase):
    id: int
    date: datetime
    converted_amount_usd: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SalesAnalytics(BaseModel):
    total_sales_usd: float
    sales_by_region: dict[str, float]
    sales_by_rep: dict[str, float]
    sales_trend: list[dict[str, float]]
