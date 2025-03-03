import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export const TopSalesPeople = ({ salesPeople }) => {
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
