import React, { useState, useMemo } from 'react';
import { Paper, Typography, Box, TextField, Stack } from '@mui/material';
import { format } from 'date-fns';
import { DataGrid } from '@mui/x-data-grid';

export const RealtimeSales = ({ sales }) => {
  const [customerFilter, setCustomerFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesCustomer = sale.customerName.toLowerCase().includes(customerFilter.toLowerCase());
      const matchesRegion = sale.region.toLowerCase().includes(regionFilter.toLowerCase());
      return matchesCustomer && matchesRegion;
    });
  }, [sales, customerFilter, regionFilter]);
  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (params) =>
        format(new Date(params.value), 'MMM dd, yyyy'),
    },
    {
      field: 'customerName',
      headerName: 'Customer Name',
      flex: 1.5,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: (params) => {
        try {
          const currency = params.row?.currency || 'USD';
          return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: currency
          }).format(params.value || 0);
        } catch (error) {
          console.error('Error formatting amount:', error);
          return 'N/A';
        }
      },
    },
    {
      field: 'currency',
      headerName: 'Currency',
      flex: 0.7,
    },
    {
      field: 'convertedAmount',
      headerName: 'Amount (USD)',
      flex: 1,
      valueFormatter: (params) => {
        try {
          return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(params.value || 0);
        } catch (error) {
          console.error('Error formatting USD amount:', error);
          return 'N/A';
        }
      },
    },
    {
      field: 'salesRep',
      headerName: 'Sales Rep',
      flex: 1,
    },
    {
      field: 'region',
      headerName: 'Region',
      flex: 1,
    },
  ];

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Real-time Sales
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Search by Customer"
            variant="outlined"
            size="small"
            fullWidth
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          />
          <TextField
            label="Search by Region"
            variant="outlined"
            size="small"
            fullWidth
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          />
        </Stack>
      </Box>
      <DataGrid
        rows={filteredSales}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        autoHeight
      />
    </Paper>
  );
};
