import React, { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { API_CONFIG } from '../config/constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Process the data for the chart
      const revenueByDay = response.data
        .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
        .map(sale => ({
          date: dayjs(sale.date).format('MMM DD'),
          revenue: sale.converted_amount_usd
        }));

      setData(revenueByDay);
      setError(null);
    } catch (err) {
      setError('Failed to fetch revenue data');
      console.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
    const interval = setInterval(fetchRevenueData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data.length) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Revenue Trend
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#90caf9" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};
