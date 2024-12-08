import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const TripActivityList = forwardRef(({ tripID }, ref) => {
  const [activities, setActivities] = useState([]);

  const fetchTripActivities = async () => {
    if (!tripID) return;

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-activity/tripActivities`, {
        params: { tripID },
      });

      // 合并楼层数据
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
      console.error('Failed to fetch trip activities:', err);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchTripActivities,
  }));

  useEffect(() => {
    fetchTripActivities();
  }, [tripID]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Activities
      </Typography>
      <List>
        {activities.map((act) => (
          <ListItem key={act.actid} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText
              primary={`ID:${act.actid} -${act.actname} (Floor: ${[...new Set(act.floors)].join(', ')})`}
              secondary={`Units: ${act.unit}, Age: ${act.min_age_limit || 'N/A'} - ${act.max_age_limit || 'N/A'}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

export default TripActivityList;
