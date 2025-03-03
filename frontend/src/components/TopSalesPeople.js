import React, { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress } from '@mui/material';
import axios from 'axios';
import { API_CONFIG } from '../config/constants';
import PersonIcon from '@mui/icons-material/Person';

export const TopSalesPeople = () => {
  const [salesPeople, setSalesPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopSalesPeople = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_SALES_REPS}?limit=3`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const topSalesPeople = (response.data || []).map(rep => ({
        name: rep.sales_rep,
        revenue: rep.total_sales_usd
      }));

      setSalesPeople(topSalesPeople);
      setError(null);
    } catch (err) {
      setError('Failed to fetch top sales people');
      console.error('Error fetching top sales people:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSalesPeople();
    const interval = setInterval(fetchTopSalesPeople, 30000);

    // Listen for refresh events
    const handleRefresh = () => fetchTopSalesPeople();
    window.addEventListener('refreshSales', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshSales', handleRefresh);
    };
  }, []);

  if (loading && !salesPeople.length) {
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
  if (!salesPeople || salesPeople.length === 0) {
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Top Sales Representatives
      </Typography>
      <List>
        {salesPeople.map((person, index) => (
          <ListItem key={person.name}>
            <ListItemAvatar>
              <Avatar>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={person.name}
              secondary={formatCurrency(person.revenue)}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
