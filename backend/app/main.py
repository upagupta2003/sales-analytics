from fastapi import FastAPI, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import asyncio
from . import models, schemas, database
from .database import engine, get_db, SessionLocal
from .realtime import sales_aggregator
from contextlib import asynccontextmanager
# Currency conversion rates
CONVERSION_RATES = {
    'USD': 1.0,
    'EUR': 1.1,
    'GBP': 1.27,
    'JPY': 0.0067,
    'AUD': 0.65
}

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sales Analytics API")

@app.get("/api/sales/", response_model=List[schemas.SalesTransaction])
def get_sales(
    skip: int = 0,
    limit: int = 100,
    start_date: datetime = None,
    end_date: datetime = None,
    region: str = None,
    sales_rep: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.SalesTransaction)
    
    if start_date:
        query = query.filter(models.SalesTransaction.date >= start_date)
    if end_date:
        query = query.filter(models.SalesTransaction.date <= end_date)
    if region:
        query = query.filter(models.SalesTransaction.region == region)
    if sales_rep:
        query = query.filter(models.SalesTransaction.sales_rep == sales_rep)
    
    return query.order_by(models.SalesTransaction.date.desc()).offset(skip).limit(limit).all()

@app.post("/api/sales/", response_model=schemas.SalesTransaction)
async def create_sale(sale: schemas.SalesTransactionCreate, db: Session = Depends(get_db)):
    # Convert amount to USD using conversion rates
    converted_amount = sale.amount * CONVERSION_RATES[sale.currency]
    
    db_sale = models.SalesTransaction(
        **sale.model_dump(),
        converted_amount_usd=converted_amount
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    
    
    
    return db_sale


