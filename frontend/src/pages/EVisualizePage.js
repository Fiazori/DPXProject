/* global Chart */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import ENavBar from '../components/ENavBar';
import axios from 'axios';

const EVisualizationPage = () => {
  const [tripID, setTripID] = useState('');
  const [error, setError] = useState(null);

  const [roomData, setRoomData] = useState(null);
  const [nationalityData, setNationalityData] = useState(null);
  const [genderData, setGenderData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const [selectedTab, setSelectedTab] = useState(0);

  // Refs to track existing charts
  const chartsRef = useRef({});

  const fetchData = async () => {
    if (!tripID) {
      setError('Please enter a Trip ID');
      return;
    }

    setError(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/visual/room-occupancy`, {
        params: { tripid: tripID },
      });
      setRoomData(Object.entries(response.data));

      const passengerResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/visual/passenger-distribution`, {
        params: { tripid: tripID },
      });
      setNationalityData(Object.entries(passengerResponse.data.nationality));
      setGenderData(Object.entries(passengerResponse.data.gender));

      const invoiceResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/visual/invoice-count`, {
        params: { tripid: tripID },
      });
      setInvoiceData(Object.entries(invoiceResponse.data));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    }
  };

  const createChart = (id, type, data, options = {}) => {
    const ctx = document.getElementById(id).getContext('2d');

    // Destroy existing chart if it exists
    if (chartsRef.current[id]) {
      chartsRef.current[id].destroy();
    }

    // Create new chart and save reference
    chartsRef.current[id] = new Chart(ctx, {
      type,
      data,
      options,
    });
  };

  useEffect(() => {
    if (roomData) {
      createChart('roomChart', 'pie', {
        labels: roomData.map(([label]) => (label === 'Y' ? 'Occupied' : label === 'N' ? 'Free' : 'Other')),
        datasets: [
          {
            data: roomData.map(([, value]) => value),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      });
    }

    if (nationalityData) {
      createChart('nationalityChart', 'bar', {
        labels: nationalityData.map(([label]) => label),
        datasets: [
          {
            label: 'Nationality',
            data: nationalityData.map(([, value]) => value),
            backgroundColor: '#36A2EB',
          },
        ],
      });
    }

    if (genderData) {
      createChart('genderChart', 'bar', {
        labels: genderData.map(([label]) => label),
        datasets: [
          {
            label: 'Gender',
            data: genderData.map(([, value]) => value),
            backgroundColor: '#82ca9d',
          },
        ],
      });
    }

    if (invoiceData) {
      createChart('invoiceChart', 'line', {
        labels: invoiceData.map(([date]) => date),
        datasets: [
          {
            label: 'Daily Invoice/Person Count',
            data: invoiceData.map(([, count]) => count),
            borderColor: '#FF6384',
            backgroundColor: '#FF6384',
            fill: false,
          },
        ],
      });
    }
  }, [roomData, nationalityData, genderData, invoiceData]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ padding: '16px', backgroundColor: '#f0f0f0', minHeight: '90vh', marginTop: '90px' }}>
      <ENavBar />
      <Box sx={{ textAlign: 'center', marginBottom: '24px' }}>
        <Typography variant="h4" gutterBottom>
          Trip Visualizations
        </Typography>
        <Box sx={{ display: 'inline-flex', gap: '16px', marginBottom: '16px' }}>
          <TextField
            label="Trip ID"
            value={tripID}
            onChange={(e) => setTripID(e.target.value)}
            sx={{ width: '300px' }}
          />
          <Button variant="contained" color="primary" onClick={fetchData}>
            Search
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ textAlign: 'center', marginBottom: '16px' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        centered
        sx={{ marginBottom: '16px', borderBottom: '1px solid #ddd' }}
      >
        <Tab label="Room Occupancy" />
        <Tab label="Nationality Distribution" />
        <Tab label="Gender Distribution" />
        <Tab label="Invoice Count" />
      </Tabs>

      <Box
  sx={{
    display: selectedTab === 0 ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '60vh',
  }}
>
  <canvas id="roomChart" width="200" height="200"></canvas>
</Box>

<Box
  sx={{
    display: selectedTab === 1 ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '60vh',
  }}
>
  <canvas id="nationalityChart" width="200" height="150"></canvas>
</Box>

<Box
  sx={{
    display: selectedTab === 2 ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '60vh',
  }}
>
  <canvas id="genderChart" width="200" height="150"></canvas>
</Box>

<Box
  sx={{
    display: selectedTab === 3 ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '60vh',
  }}
>
  <canvas id="invoiceChart" width="300" height="150"></canvas>
</Box>

    </Box>
  );
};

export default EVisualizationPage;
