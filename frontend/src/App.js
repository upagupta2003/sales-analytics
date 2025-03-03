import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Grid, Stack } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';
import { SalesOverview } from './components/SalesOverview';
import { RevenueChart } from './components/RevenueChart';
import { TopSalesPeople } from './components/TopSalesPeople';
import { TopRegions } from './components/TopRegions';
import { RealtimeSales } from './components/RealtimeSales';
import { API_CONFIG } from './config/constants';

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
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueByDay: [],
    topSalesPeople: [],
    realtimeSales: [],
    totalCount: 0
  });

  const handleDateChange = (date, isStart) => {
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const fetchSalesData = async () => {
    if (!startDate || !endDate) return;

    const formattedStartDate = startDate.format('YYYY-MM-DD');
    const formattedEndDate = endDate.format('YYYY-MM-DD');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data with params:', { formattedStartDate, formattedEndDate });
      
      // Fetch sales data, total revenue, top sales reps, and top regions in parallel
      const [salesResponse, totalRevenueResponse, topSalesResponse, topRegionsResponse] = await Promise.all([
        axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        ),
        axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOTAL_REVENUE}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        ),
        axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_SALES_REPS}?limit=3`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        ),
        axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_REGIONS}?limit=3`,
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

      console.log('Raw sales response:', salesResponse);
      let sales = salesResponse.data;
      let total_count = salesResponse.headers['x-total-count'] || 0;
      console.log('Extracted sales:', sales);
      const allTimeRevenue = totalRevenueResponse.data?.total_sales_usd || 0;
      if (!Array.isArray(sales)) {
        sales = [sales].filter(Boolean);
      }
      console.log('Processed sales array:', sales);
      console.log('Received total revenue:', allTimeRevenue);
      console.log('Total revenue response:', totalRevenueResponse);
      

      
      console.log('Processed sales data:', sales);
      
      // Calculate metrics from sales data
      // Use period revenue for charts and stats, but all-time revenue for the overview
      const periodRevenue = sales.reduce((sum, sale) => sum + sale.converted_amount_usd, 0);
      const averageOrderValue = periodRevenue / (sales.length || 1);

      // Get top sales reps from the API response
      const topSalesPeople = (topSalesResponse.data || []).map(rep => ({
        name: rep.sales_rep,
        revenue: rep.total_sales_usd
      }));
      console.log('Top sales people:', topSalesPeople);

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

      // Get top regions from the API response
      const topRegions = (topRegionsResponse.data || []);
      console.log('Top regions:', topRegions);

      const newData = {
        totalRevenue: allTimeRevenue,
        averageOrderValue,
        topRegions: topRegionsResponse.data || [],
        revenueByDay: sales
          .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
          .map(sale => ({
            date: dayjs(sale.date).format('MMM DD'),
            revenue: sale.converted_amount_usd
          })),
        topSalesPeople,
        realtimeSales: sales.map(sale => ({
          id: sale.id,
          date: sale.date,
          customerName: sale.customer_name,
          amount: sale.amount,
          currency: sale.currency,
          convertedAmount: sale.converted_amount_usd,
          salesRep: sale.sales_rep,
          region: sale.region || 'Unknown'
        })),
        totalCount: total_count,
        topRegions: topRegions
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

  useEffect(() => {
    fetchSalesData();
    const interval = setInterval(fetchSalesData, 30000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => handleDateChange(date, true)}
              slotProps={{ textField: { size: 'small' } }}
              maxDate={endDate}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => handleDateChange(date, false)}
              slotProps={{ textField: { size: 'small' } }}
              minDate={startDate}
              maxDate={dayjs()}
            />
          </Stack>
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
    </LocalizationProvider>
  );
}

export default App;
