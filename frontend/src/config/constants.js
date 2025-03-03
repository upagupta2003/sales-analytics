// API Configuration
export const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Middle East',
  'Oceania'
];

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'INR'
];

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    SALES: '/api/sales',
    TOTAL_REVENUE: '/api/analytics/realTime/total_revenue',
    TOP_SALES_REPS: '/api/analytics/realTime/top_sales_reps',
    TOP_REGIONS: '/api/analytics/realTime/top_regions'
  }
};
