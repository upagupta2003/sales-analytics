import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Grid, Stack } from '@mui/material';
import { SalesOverview } from './components/SalesOverview';
import { RevenueChart } from './components/RevenueChart';
import { TopSalesPeople } from './components/TopSalesPeople';
import { RealtimeSales } from './components/RealtimeSales';
import { AddSalesTransaction } from './components/AddSalesTransaction';
import { API_CONFIG } from './config/constants';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());

  const handleDateChange = (date, isStart) => {
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => handleDateChange(date, true)}
              slotProps={{ textField: { size: 'small' } }}
              maxDate={endDate}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => handleDateChange(date, false)}
              slotProps={{ textField: { size: 'small' } }}
              minDate={startDate}
              maxDate={dayjs()}
            />
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SalesOverview />
            </Grid>
            <Grid item xs={12} md={8}>
              <RevenueChart />
            </Grid>
            <Grid item xs={12} md={4}>
              <TopSalesPeople />
            </Grid>

            <Grid item xs={12}>
              <AddSalesTransaction />
              <RealtimeSales />
            </Grid>
          </Grid>
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
