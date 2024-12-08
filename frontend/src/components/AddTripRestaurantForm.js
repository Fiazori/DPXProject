import React, { useState, useEffect } from 'react';
import { Box, Button, Autocomplete, TextField } from '@mui/material';
import axios from 'axios';

const AddTripRestaurantForm = ({ tripID, onRestaurantAdded }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-restaurant/list`);
        setRestaurants(response.data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      }
    };
    fetchRestaurants();
  }, []);

  const handleAddRestaurant = async () => {
    if (!selectedRestaurant || !tripID) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trip-restaurant/add`, {
        tripID,
        resid: selectedRestaurant.resid,
      });
      onRestaurantAdded(); // Refresh restaurant list
    } catch (err) {
      console.error('Failed to add restaurant:', err);
    }
  };

  return (
    <Box display="flex" gap={2}>
      <Autocomplete
        options={restaurants}
        getOptionLabel={(option) => `ID:${option.resid} - ${option.resname}`}
        onChange={(event, value) => setSelectedRestaurant(value)}
        renderInput={(params) => <TextField {...params} label="Select Restaurant" />}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleAddRestaurant}>
        Add
      </Button>
    </Box>
  );
};

export default AddTripRestaurantForm;
