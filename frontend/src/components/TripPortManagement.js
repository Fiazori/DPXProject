import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import axios from 'axios';

const TripPortManagement = ({ tripID, fetchCurrentTrip }) => {
  const [ports, setPorts] = useState([]);
  const [tripPorts, setTripPorts] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTripPort, setSelectedTripPort] = useState(null);
  const [newArrivalTime, setNewArrivalTime] = useState('');
  const [newDepartureTime, setNewDepartureTime] = useState('');
  const [newSequenceNumber, setNewSequenceNumber] = useState(0);
  const [selectedPort, setSelectedPort] = useState(null);

  // Fetch all ports
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-port/ports`);
        setPorts(response.data);
      } catch (err) {
        console.error('Failed to fetch ports:', err);
      }
    };

    fetchPorts();
  }, []);

  const formatToLocalTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  // Fetch trip ports
  const fetchTripPorts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-port/tripPorts`, {
        params: { tripID },
      });
      setTripPorts(response.data);
    } catch (err) {
      console.error('Failed to fetch trip ports:', err);
    }
  };

  useEffect(() => {
    if (tripID) {
      fetchTripPorts();
    }
  }, [tripID]);

  // Handle edit
  const handleEdit = (tripPort) => {
    setSelectedTripPort(tripPort);
    setNewArrivalTime(tripPort.arrivaltime);
    setNewDepartureTime(tripPort.departuretime);
    setNewSequenceNumber(tripPort.sequence_number);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      // Adjust sequence numbers
      const updatedTripPorts = [...tripPorts]
        .filter((port) => port.tripportid !== selectedTripPort.tripportid)
        .map((port) => ({
          ...port,
          sequence_number:
            port.sequence_number >= newSequenceNumber
              ? port.sequence_number + 1
              : port.sequence_number,
        }));

      const currentPort = {
        ...selectedTripPort,
        sequence_number: newSequenceNumber,
        arrivaltime: newArrivalTime,
        departuretime: newDepartureTime,
      };

      updatedTripPorts.push(currentPort);

      // Sort by sequence number
      updatedTripPorts.sort((a, b) => a.sequence_number - b.sequence_number);

      setTripPorts(updatedTripPorts);

      // Sync with backend
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/trip-port/updateOrder`, {
        tripID,
        tripPorts: updatedTripPorts.map(({ tripportid, sequence_number }) => ({
          tripportid,
          sequence_number,
        })),
      });

      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/trip-port/updateTimes`, {
        tripportid: selectedTripPort.tripportid,
        arrivaltime: newArrivalTime,
        departuretime: newDepartureTime,
      });

      setEditDialogOpen(false);
      fetchTripPorts();
      fetchCurrentTrip(tripID); 
    } catch (err) {
      console.error('Failed to update trip port times and sequence number:', err);
    }
  };

  // Handle delete
  const handleDelete = async (tripportid) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/trip-port/delete`, {
        data: { tripportid, tripID },
      });
      fetchTripPorts();
      fetchCurrentTrip(tripID); 
    } catch (err) {
      console.error('Failed to delete trip port:', err);
    }
  };

  // Handle add new trip port
  const handleAdd = () => {
    setSelectedPort(null);
    setNewArrivalTime('');
    setNewDepartureTime('');
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      const newSequenceNumber = tripPorts.length + 1;

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trip-port/add`, {
        tripID,
        portID: selectedPort?.portid,
        arrivaltime: newArrivalTime,
        departuretime: newDepartureTime,
        sequence_number: newSequenceNumber,
      });

      setAddDialogOpen(false);
      fetchTripPorts();
      fetchCurrentTrip(tripID); 
    } catch (err) {
      console.error('Failed to add trip port:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trip Ports
      </Typography>
      <List>
        {tripPorts.map((port) => (
          <ListItem key={port.tripportid} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText
              primary={`${port.pname} (ID: ${port.portid})`}
              secondary={`Sequence: ${port.sequence_number}, Arrival: ${formatToLocalTime(port.arrivaltime)}, Departure: ${formatToLocalTime(port.departuretime)}`}
            />
            <Box>
              <IconButton onClick={() => handleEdit(port)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(port.tripportid)}>
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
      <Box display="flex" justifyContent="center" mt={2}>
  <Button variant="contained" color="primary" onClick={handleAdd}>
    Add Port
  </Button>
</Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Trip Port</DialogTitle>
        <DialogContent>
          <TextField
            label="Sequence Number"
            type="number"
            fullWidth
            value={newSequenceNumber}
            onChange={(e) => setNewSequenceNumber(Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Arrival Time"
            type="datetime-local"
            fullWidth
            value={newArrivalTime}
            onChange={(e) => setNewArrivalTime(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Departure Time"
            type="datetime-local"
            fullWidth
            value={newDepartureTime}
            onChange={(e) => setNewDepartureTime(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Trip Port</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={ports}
            getOptionLabel={(option) => `${option.pname} (ID: ${option.portid})`}
            onChange={(event, value) => setSelectedPort(value)}
            renderInput={(params) => <TextField {...params} label="Select Port" />}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Arrival Time"
            type="datetime-local"
            fullWidth
            value={newArrivalTime}
            onChange={(e) => setNewArrivalTime(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Departure Time"
            type="datetime-local"
            fullWidth
            value={newDepartureTime}
            onChange={(e) => setNewDepartureTime(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripPortManagement;
