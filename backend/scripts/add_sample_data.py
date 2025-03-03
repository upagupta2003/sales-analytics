import sys
import os

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import SessionLocal
from db.sample_data import generate_sample_data_sync

def main():
    db = SessionLocal()
    try:
        print("Generating sample data...")
        generate_sample_data_sync(db, num_records=100)
        print("Sample data generated successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
