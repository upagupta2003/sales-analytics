from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import asyncio
import db
from db import engine, get_db, SessionLocal
from app.service.realtime import sales_aggregator
from contextlib import asynccontextmanager
from app.models import models, schemas
# Currency conversion rates
CONVERSION_RATES = {
    'USD': 1.0,
    'EUR': 1.1,
    'GBP': 1.27,
    'JPY': 0.0067,
    'AUD': 0.65
}

models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        sales_aggregator.initialize_from_database(db)
        yield
    finally:
        db.close()

app = FastAPI(title="Sales Analytics API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    # Update real-time counters
    sales_aggregator.update_sales_counters(db_sale)
    
    # Broadcast update to connected clients
    await sales_aggregator.broadcast_sales_update({
        "type": "new_sale",
        "data": {
            "amount_usd": converted_amount,
            "region": sale.region,
            "sales_rep": sale.sales_rep
        }
    })
    
    return db_sale

@app.get("/api/analytics/realTime/total_revenue")
def get_real_time_analytics():
    return sales_aggregator.get_sales_metrics()

@app.get("/api/analytics/realTime/top_sales_reps")
def get_top_sales_reps(limit: int = 10):
    return sales_aggregator.get_top_sales_reps(limit=limit)

@app.get("/api/analytics/realTime/top_regions")
def get_top_regions(limit: int = 10):
    return sales_aggregator.get_top_regions(limit=limit)

@app.websocket("/ws/sales")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Get total USD sales
            metrics = sales_aggregator.get_sales_metrics()
            await websocket.send_json(metrics)
            await asyncio.sleep(1)
    except Exception as e:
        print(f"WebSocket error: {e}")

@app.get("/api/analytics/")
def get_analytics(
    days: int = 30,
    db: Session = Depends(get_db)
):
    # Get historical sales total
    total_sales = db.query(models.SalesTransaction).with_entities(
        func.sum(models.SalesTransaction.converted_amount_usd)
    ).scalar() or 0
    
    # Add real-time sales
    real_time_metrics = sales_aggregator.get_sales_metrics()
    
    return {
        "total_sales_usd": total_sales + real_time_metrics['total_sales_usd']
    }
