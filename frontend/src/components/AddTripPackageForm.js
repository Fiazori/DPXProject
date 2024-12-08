import React, { useState, useEffect } from 'react';
import { Box, Button, Autocomplete, TextField } from '@mui/material';
import axios from 'axios';

const AddTripPackageForm = ({ tripID, onPackageAdded }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-package/list`);
        setPackages(response.data);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      }
    };
    fetchPackages();
  }, []);

  const handleAddPackage = async () => {
    if (!selectedPackage || !tripID) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trip-package/add`, {
        tripID,
        packID: selectedPackage.packID,
      });
      onPackageAdded(); // Refresh package list
    } catch (err) {
      console.error('Failed to add package:', err);
    }
  };

  return (
    <Box display="flex" gap={2}>
      <Autocomplete
        options={packages}
        getOptionLabel={(option) => `ID:${option.packID} - ${option.packTYPE}`}
        onChange={(event, value) => setSelectedPackage(value)}
        renderInput={(params) => <TextField {...params} label="Select Package" />}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleAddPackage}>
        Add
      </Button>
    </Box>
  );
};

export default AddTripPackageForm;
