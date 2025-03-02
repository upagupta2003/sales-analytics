import React from 'react';
import { Paper, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export const RealtimeSales = ({ sales }) => {
  const columns = [
    { field: 'customerName', headerName: 'Customer', flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: (params) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value),
    },
    {
      field: 'timestamp',
      headerName: 'Time',
      flex: 1,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleTimeString(),
    },
  ];

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Real-time Sales
      </Typography>
      <DataGrid
        rows={sales}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        autoHeight
      />
    </Paper>
  );
};
