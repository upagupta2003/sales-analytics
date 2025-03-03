import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Stack,
  Alert,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { API_CONFIG, REGIONS, CURRENCIES } from '../config/constants';

// Custom events for different components
const refreshEvents = {
  sales: new CustomEvent('refreshSales'),
  revenue: new CustomEvent('refreshRevenue'),
  overview: new CustomEvent('refreshOverview')
};

export const AddSalesTransaction = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    amount: '',
    currency: 'USD',
    sales_rep: '',
    region: '',
    date: new Date().toISOString()
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError('');
    setFormData({
      customer_name: '',
      amount: '',
      currency: 'USD',
      sales_rep: '',
      region: '',
      date: new Date().toISOString()
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Prepare data with the correct amount type
      const submitData = {
        ...formData,
        amount: amount
      };

      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`,
        submitData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      handleClose();
      // Trigger refresh events for affected components
      window.dispatchEvent(refreshEvents.sales);
      window.dispatchEvent(refreshEvents.revenue);
      window.dispatchEvent(refreshEvents.overview);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Add Sale
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Sales Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              required
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              required
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: "0", step: "0.01" }}
            />

            <TextField
              required
              select
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              fullWidth
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              label="Sales Representative"
              name="sales_rep"
              value={formData.sales_rep}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              required
              select
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              fullWidth
            >
              {REGIONS.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
