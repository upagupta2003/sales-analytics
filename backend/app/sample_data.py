from faker import Faker
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from . import models
# Currency conversion rates
CONVERSION_RATES = {
    'USD': 1.0,
    'EUR': 1.1,
    'GBP': 1.27,
    'JPY': 0.0067,
    'AUD': 0.65
}

fake = Faker()

CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD']
REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']
SALES_REPS = ['John Smith', 'Emma Wilson', 'Carlos Rodriguez', 'Sarah Chen', 'Michael Brown']

def generate_sample_data(db: Session, num_records: int = 100):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    for _ in range(num_records):
        # Generate random date within last 30 days
        date = fake.date_time_between(start_date=start_date, end_date=end_date)
        
        # Generate random amount between 100 and 10000
        amount = round(random.uniform(100, 10000), 2)
        currency = random.choice(CURRENCIES)
        
        # Convert to USD using conversion rates
        converted_amount = amount * CONVERSION_RATES[currency]
        
        sale = models.SalesTransaction(
            date=date,
            customer_name=fake.company(),
            amount=amount,
            currency=currency,
            converted_amount_usd=converted_amount,
            sales_rep=random.choice(SALES_REPS),
            region=random.choice(REGIONS)
        )
        
        db.add(sale)
    
    db.commit()
