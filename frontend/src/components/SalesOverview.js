import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export const SalesOverview = ({ data }) => {
  console.log('SalesOverview data:', data);
  const metrics = [
    {
      title: 'All-Time Revenue',
      subtitle: 'Total revenue since inception',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.totalRevenue),
      icon: <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    },
    {
      title: 'Average Order Value',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.totalOrders ? data.totalRevenue / data.totalOrders : 0),
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
