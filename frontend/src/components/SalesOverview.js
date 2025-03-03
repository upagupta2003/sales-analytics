import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { API_CONFIG } from '../config/constants';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export const SalesOverview = () => {
  const [data, setData] = useState({
    totalRevenue: 0,
    topRegions: [],
    topSalesPeople: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [totalRevenueResponse, topSalesResponse, topRegionsResponse] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOTAL_REVENUE}`),
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_SALES_REPS}`),
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_REGIONS}`)
      ]);

      setData({
        totalRevenue: totalRevenueResponse.data?.total_sales_usd || 0,
        topRegions: topRegionsResponse.data || [],
        topSalesPeople: (topSalesResponse.data || []).map(rep => ({
          name: rep.sales_rep,
          revenue: rep.total_sales_usd
        }))
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch overview data');
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
    const interval = setInterval(fetchOverviewData, 30000);

    // Listen for refresh events
    const handleRefresh = () => fetchOverviewData();
    window.addEventListener('refreshOverview', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshOverview', handleRefresh);
    };
  }, []);

  if (loading && !data.totalRevenue) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }
  console.log('SalesOverview data:', data);
  const metrics = [
    {
      title: 'All-Time Revenue',
      subtitle: 'Total revenue since inception',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.totalRevenue),
      icon: <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Top Region',
      value: data.topRegions?.[0]?.region || 'N/A',
      subtitle: data.topRegions?.[0] ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.topRegions[0].total_sales_usd) : '',
      icon: <PublicIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    },
    {
      title: 'Average Order Value',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.averageOrderValue),
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    },
  ];

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    {metric.title}
                  </Typography>
                  {metric.subtitle && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      {metric.subtitle}
                    </Typography>
                  )}
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {metric.value}
                </Typography>
              </Box>
              {metric.icon}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
