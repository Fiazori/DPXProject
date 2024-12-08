import React, { useState, useEffect } from 'react';
import { Box, Button, Autocomplete, TextField } from '@mui/material';
import axios from 'axios';

const AddTripActivityForm = ({ tripID, onActivityAdded }) => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-activity/list`);
        const groupedActivities = response.data.reduce((acc, activity) => {
          const existingActivity = acc.find((a) => a.actid === activity.actid);
          if (existingActivity) {
            existingActivity.floors.push(activity.floor || 'N/A');
          } else {
            acc.push({ ...activity, floors: [activity.floor || 'N/A'] });
          }
          return acc;
        }, []);
        setActivities(groupedActivities);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      }
    };
    fetchActivities();
  }, []);

  const handleAddActivity = async () => {
    if (!selectedActivity || !tripID) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trip-activity/add`, {
        tripID,
        actID: selectedActivity.actid,
      });
      onActivityAdded(); // Refresh activity list
    } catch (err) {
      console.error('Failed to add activity:', err);
    }
  };

  return (
    <Box display="flex" gap={2}>
      <Autocomplete
        options={activities}
        getOptionLabel={(option) => `ID:${option.actid} - ${option.actname} (Floors: ${[...new Set(option.floors)].join(', ')})`}
        onChange={(event, value) => setSelectedActivity(value)}
        renderInput={(params) => <TextField {...params} label="Select Activity" />}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleAddActivity}>
        Add
      </Button>
    </Box>
  );
};

export default AddTripActivityForm;
