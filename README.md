# Sales Analytics Dashboard

A full-stack sales analytics platform that provides real-time insights into sales performance, trends, and regional analytics.

## Project Structure

- `backend/`: FastAPI backend service with PostgreSQL database and Redis for real-time analytics
- `frontend/`: React-based frontend application

## Features

- Real-time sales transaction tracking and analytics
- Interactive dashboard with data visualization
- Multi-currency support with automatic USD conversion
- Regional and sales representative performance metrics
- Historical sales trend analysis
- RESTful API with comprehensive documentation

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/upagupta2003/sales-analytics.git
cd sales-analytics
```

2. Set up the backend:
- Follow the setup instructions in `backend/README.md`
- Ensure PostgreSQL is running locally

3. Set up the frontend:
- Follow the setup instructions in `frontend/README.md`
- Configure the API endpoint in the frontend environment

## Development

For local development, you'll need to run both the backend and frontend services:

1. Start the backend server (from the backend directory):
```bash
uvicorn app.main:app --reload
```

2. Start the frontend development server (from the frontend directory):
```bash
npm run dev
```

## Documentation

- Backend API documentation: http://localhost:8000/docs
- Component-specific documentation can be found in their respective README files:
  - Backend: See `backend/README.md`
  - Frontend: See `frontend/README.md`

## License

MIT License - See LICENSE file for details
