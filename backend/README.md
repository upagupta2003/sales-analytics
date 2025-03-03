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

## Local Testing

### Dependencies

Make sure you have the following services running locally:

- PostgreSQL (for persistent storage)
- Redis (for real-time analytics)

### Setting up PostgreSQL

1. Install PostgreSQL if not already installed:
```bash
brew install postgresql@14
brew services start postgresql
```

2. Create the database:
```bash
psql postgres

# In psql shell:
CREATE DATABASE sales_analytics;
CREATE USER sales_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sales_analytics TO sales_user;
\q
```

3. Update your `.env` file with the database credentials:
```bash
DATABASE_URL=postgresql://sales_user:your_password@localhost/sales_analytics
```

### Adding Sample Data

The project includes a sample data generator in `db/sample_data.py`. To generate sample data:

1. Make sure you have the Faker package installed:
```bash
pip install Faker
```

2. Run the following Python code:
```python
from db.database import SessionLocal
from db.sample_data import generate_sample_data

db = SessionLocal()
generate_sample_data(db, num_records=100)
```

This will create 100 random sales transactions with:
- Realistic company names using Faker
- Random amounts between 100 and 10,000
- Dates spread across the last 30 days
- Distribution across 5 regions: North America, Europe, Asia Pacific, Latin America, Middle East
- Distribution across 5 sales representatives
- Multiple currencies (USD, EUR, GBP, JPY, AUD) with automatic conversion to USD
