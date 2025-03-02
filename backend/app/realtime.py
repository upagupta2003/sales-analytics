from fastapi import WebSocket
from redis import Redis
from datetime import datetime, timedelta
import json
import asyncio
from typing import Dict, List

redis = Redis(host='localhost', port=6379, db=0, decode_responses=True)

class SalesAggregator:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    def initialize_from_database(self, db):
        # Get total sales from database
        from sqlalchemy import func
        from .models import SalesTransaction
        
        total_sales = db.query(func.sum(SalesTransaction.converted_amount_usd)).scalar() or 0
        
        # Set in Redis
        redis.set("sales:total_usd", total_sales)
        return total_sales

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_sales_update(self, data: Dict):
        for connection in self.active_connections:
            await connection.send_json(data)

    @staticmethod
    def update_sales_counters(transaction):
        # Increment total sales counter
        redis.incrbyfloat("sales:total_usd", transaction.converted_amount_usd)

    @staticmethod
    def get_sales_metrics():
        # Get total sales in USD
        total_sales = float(redis.get("sales:total_usd") or 0)
        return {
            "total_sales_usd": total_sales
        }

sales_aggregator = SalesAggregator()
