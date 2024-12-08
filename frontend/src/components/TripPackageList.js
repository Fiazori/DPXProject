import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const TripPackageList = forwardRef(({ tripID }, ref) => {
  const [packages, setPackages] = useState([]);

  const fetchTripPackages = async () => {
    if (!tripID) return;

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-package/tripPackages`, {
        params: { tripID },
      });
      setPackages(response.data);
    } catch (err) {
      console.error('Failed to fetch trip packages:', err);
    }
  };

  // 暴露 fetchTripPackages 方法给父组件
  useImperativeHandle(ref, () => ({
    fetchTripPackages,
  }));

  useEffect(() => {
    fetchTripPackages();
  }, [tripID]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Packages
      </Typography>
      <List>
        {packages.map((pkg) => (
          <ListItem key={pkg.packID} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText
              primary={`ID:${pkg.packID} - ${pkg.packTYPE}`}
              secondary={`Cost: ${pkg.packCOST}, Pricing: ${pkg.PRICING_TYPE}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

export default TripPackageList;
