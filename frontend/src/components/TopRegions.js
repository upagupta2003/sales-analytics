import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';

export const TopRegions = ({ regions }) => {
  if (!regions || regions.length === 0) {
    return null;
  }

  // Format currency for labels
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
        Top Performing Regions
      </Typography>
      <List>
        {regions.map((region) => (
          <ListItem key={region.region}>
            <ListItemAvatar>
              <Avatar>
                <PublicIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={region.region}
              secondary={formatCurrency(region.total_sales_usd)}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
