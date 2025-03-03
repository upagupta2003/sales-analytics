# Sales Analytics Backend

Real-time sales analytics dashboard backend built with FastAPI.

## Features

- Real-time sales transaction tracking
- Currency conversion to USD
- Sales analytics by region and sales representative
- Historical sales trends
- RESTful API endpoints

## Setup

1. Install dependencies:
```bash
poetry install
```

2. Set up the database:
```bash
# Create PostgreSQL database
createdb sales_analytics

# Run migrations
alembic upgrade head
```

3. Create a `.env` file:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost/sales_analytics
```

4. Generate sample data (optional):
```python
from app.database import SessionLocal
from app.sample_data import generate_sample_data

db = SessionLocal()
generate_sample_data(db, num_records=100)
```

5. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

- `GET /api/sales/`: Get sales transactions with optional filters
  - Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Number of records to return
    - start_date: Filter by start date
    - end_date: Filter by end date
    - region: Filter by region
    - sales_rep: Filter by sales representative

- `POST /api/sales/`: Create a new sales transaction
  - Required fields:
    - customer_name
    - amount
    - currency
    - sales_rep
    - region

- `GET /api/analytics/`: Get sales analytics
  - Query parameters:
    - days: Number of days to analyze (default: 30)

## Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
