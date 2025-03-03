import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
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
