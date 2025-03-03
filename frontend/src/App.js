import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { SalesOverview } from './components/SalesOverview';
import { RevenueChart } from './components/RevenueChart';
import { TopSalesPeople } from './components/TopSalesPeople';
import { RealtimeSales } from './components/RealtimeSales';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [startDate, setStartDate] = useState(sub(new Date(), { days: 30 }));
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueByDay: [],
    topSalesPeople: [],
    realtimeSales: []
  });

  useEffect(() => {
    fetchSalesData();
    const interval = setInterval(fetchSalesData, 30000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const handleDateChange = (date, isStart) => {
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  useEffect(() => {
    const fetchSalesData = async () => {
    if (!startDate || !endDate) return;
    
    try {
      try {
        console.log('Starting data fetch...');
        setLoading(true);
        setError(null);

        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        
        console.log('Fetching data with params:', { startDate, endDate });
        
        // Fetch both sales data and total revenue in parallel
        const [salesResponse, totalRevenueResponse] = await Promise.all([
          axios.get(
            `http://localhost:8000/api/sales/?skip=0&limit=100&start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          ),
          axios.get(
            'http://localhost:8000/api/analytics/realTime/total_revenue',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          )
        ]);

        console.log('Raw Sales Response:', salesResponse);
        console.log('Raw Total Revenue Response:', totalRevenueResponse);

        if (!salesResponse.data) {
          throw new Error('No sales data received from the server');
        }

        let sales = salesResponse.data;
        const allTimeRevenue = totalRevenueResponse.data?.total_revenue || 0;
        
        // Ensure sales is an array
        if (!Array.isArray(sales)) {
          sales = [sales].filter(Boolean);
        }
        
        console.log('Processed sales data:', sales);
        
        // Calculate metrics from sales data
        // Use period revenue for charts and stats, but all-time revenue for the overview
        const periodRevenue = sales.reduce((sum, sale) => sum + sale.converted_amount_usd, 0);
        const totalOrders = sales.length;
        const averageOrderValue = totalOrders > 0 ? periodRevenue / totalOrders : 0;

        // Group sales by sales rep for top performers
        const salesByRep = sales.reduce((acc, sale) => {
          if (!acc[sale.sales_rep]) {
            acc[sale.sales_rep] = 0;
          }
          acc[sale.sales_rep] += sale.converted_amount_usd;
          return acc;
        }, {});

        const topSalesPeople = Object.entries(salesByRep)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Format sales for real-time display
        const realtimeSales = sales
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)
          .map(sale => {
            // Ensure all required fields exist
            if (!sale || typeof sale !== 'object') {
              console.error('Invalid sale object:', sale);
              return null;
            }

            return {
            id: sale.id,
            date: sale.date,
            customerName: sale.customer_name,
            amount: sale.amount,
            currency: sale.currency,
            convertedAmount: sale.converted_amount_usd,
            salesRep: sale.sales_rep,
            region: sale.region || 'Unknown'
          };
          }).filter(Boolean);

        const newData = {
          totalRevenue: allTimeRevenue, // Use all-time revenue from the new endpoint
          totalOrders,
          averageOrderValue,
          revenueByDay: sales
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(sale => ({
              date: format(new Date(sale.date), 'MMM dd'),
              revenue: sale.converted_amount_usd
            })),
          topSalesPeople,
          realtimeSales
        };

        console.log('Setting new data:', newData);
        setSalesData(newData);
        setLoading(false);
        setError(null);
        console.log('Data update complete');

      } catch (error) {
        console.error('Error fetching sales data:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError('Failed to fetch sales data. Please try again later.');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSalesData().catch(err => {
      console.error('Initial fetch failed:', err);
      setError('Failed to load initial data');
      setLoading(false);
    });

    // Set up polling
    const interval = setInterval(fetchSalesData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.main', color: 'error.contrastText', mb: 2 }}>
          {error}
        </Box>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SalesOverview data={salesData} />
            </Grid>
            <Grid item xs={12} md={8}>
              <RevenueChart data={salesData.revenueByDay} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TopSalesPeople salesPeople={salesData.topSalesPeople} />
            </Grid>
            <Grid item xs={12}>
              <RealtimeSales sales={salesData.realtimeSales} />
            </Grid>
          </Grid>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
