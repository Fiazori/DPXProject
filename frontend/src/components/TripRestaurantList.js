import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const TripRestaurantList = forwardRef(({ tripID }, ref) => {
    const [restaurants, setRestaurants] = useState([]);
  
    const fetchTripRestaurants = async () => {
      if (!tripID) return;
  
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-restaurant/tripRestaurants`, {
          params: { tripID },
        });
        setRestaurants(response.data);
      } catch (err) {
        console.error('Failed to fetch trip restaurants:', err);
      }
    };
  
    // 使用 useImperativeHandle 将方法暴露给父组件
    useImperativeHandle(ref, () => ({
      fetchTripRestaurants,
    }));
  
    useEffect(() => {
      fetchTripRestaurants();
    }, [tripID]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Restaurants
      </Typography>
      <List>
        {restaurants.map((res) => (
          <ListItem key={res.resid} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText
              primary={`ID:${res.resid} - ${res.resname}`}
              secondary={`Type: ${res.restype}, Open: ${res.resstarttime} - ${res.resendtime}, Floor: ${res.resfloor}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

export default TripRestaurantList;
