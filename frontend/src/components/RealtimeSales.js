import React, { useState, useEffect, useMemo } from 'react';
import { Paper, Typography, Box, TextField, Stack } from '@mui/material';
import axios from 'axios';
import { API_CONFIG } from '../config/constants';
import { format } from 'date-fns';
import { DataGrid } from '@mui/x-data-grid';

export const RealtimeSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = async () => {
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
      
      // Transform the data to match the expected format
      const salesData = response.data.map(sale => ({
        id: sale.id,
        date: sale.date,
        customerName: sale.customer_name,
        amount: sale.amount,
        currency: sale.currency,
        convertedAmount: sale.converted_amount_usd,
        salesRep: sale.sales_rep,
        region: sale.region || 'Unknown'
      }));

      setSales(salesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sales data');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSales();

    // Set up interval for periodic updates
    const interval = setInterval(fetchSales, 30000);

    // Listen for refresh events
    const handleRefresh = () => fetchSales();
    window.addEventListener('refreshSales', handleRefresh);

    // Cleanup interval and event listener on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshSales', handleRefresh);
    };
  }, []);
  const [customerFilter, setCustomerFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  const filteredSales = useMemo(() => {
    console.log('Filtering sales:', sales);
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

        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
        }}
        disableRowSelectionOnClick
        autoHeight
        getRowId={(row) => row.id}
        loading={loading}

      />
    </Paper>
  );
};
