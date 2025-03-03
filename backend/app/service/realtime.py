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
        
    def _clear_redis_data(self):
        """Clear all sales-related data from Redis"""
        # Delete all keys related to sales
        keys_to_delete = [
            "sales:total_usd",
            "sales:by_rep",
            "sales:by_region"
        ]
        for key in keys_to_delete:
            redis.delete(key)
        print("Redis data cleared")

    def initialize_from_database(self, db):
        # Clear existing Redis data
        self._clear_redis_data()
        
        # Get total sales from database
        from sqlalchemy import func
        from app.models.models import SalesTransaction
        
        total_sales = db.query(func.sum(SalesTransaction.converted_amount_usd)).scalar() or 0
        
        # Get sales by rep
        sales_by_rep = db.query(
            SalesTransaction.sales_rep,
            func.sum(SalesTransaction.converted_amount_usd).label('total_sales')
        ).group_by(SalesTransaction.sales_rep).all()
        
        # Get sales by region
        sales_by_region = db.query(
            SalesTransaction.region,
            func.sum(SalesTransaction.converted_amount_usd).label('total_sales')
        ).group_by(SalesTransaction.region).all()
        
        # Set in Redis
        redis.set("sales:total_usd", total_sales)
        
        # Store sales by rep in Redis
        for rep, amount in sales_by_rep:
            if rep and amount:
                redis.zadd("sales:by_rep", {rep: float(amount)})
        
        # Store sales by region in Redis
        for region, amount in sales_by_region:
            if region and amount:
                redis.zadd("sales:by_region", {region: float(amount)})
        
        print(f"Redis data reloaded: {total_sales} total sales, {len(sales_by_rep)} sales reps, {len(sales_by_region)} regions")
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
        
        # Update sales rep counter in sorted set
        if transaction.sales_rep:
            redis.zincrby("sales:by_rep", transaction.converted_amount_usd, transaction.sales_rep)
            
        # Update region counter in sorted set
        if transaction.region:
            redis.zincrby("sales:by_region", transaction.converted_amount_usd, transaction.region)

    @staticmethod
    def get_sales_metrics():
        # Get total sales in USD
        total_sales = float(redis.get("sales:total_usd") or 0)
        return {
            "total_sales_usd": total_sales
        }
    
    @staticmethod
    def get_top_sales_reps(limit: int = 10):
        # Get top sales reps from sorted set
        top_reps = redis.zrevrange("sales:by_rep", 0, limit-1, withscores=True)
        return [
            {"sales_rep": rep, "total_sales_usd": amount}
            for rep, amount in top_reps
        ]
    
    @staticmethod
    def get_top_regions(limit: int = 10):
        # Get top regions from sorted set
        top_regions = redis.zrevrange("sales:by_region", 0, limit-1, withscores=True)
        return [
            {"region": region, "total_sales_usd": amount}
            for region, amount in top_regions
        ]

sales_aggregator = SalesAggregator()
