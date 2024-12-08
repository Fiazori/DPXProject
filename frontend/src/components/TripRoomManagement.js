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

const TripRoomManagement = ({ tripID }) => {
  const [rooms, setRooms] = useState([]);
  const [staterooms, setStaterooms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch all options (staterooms and locations)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-room/options`);
        setStaterooms(response.data.staterooms);
        setLocations(response.data.locations);
      } catch (err) {
        console.error('Failed to fetch options:', err);
      }
    };

    fetchOptions();
  }, []);

  // Fetch all rooms for the trip
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-room/rooms`, {
        params: { tripID },
      });
      setRooms(response.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  useEffect(() => {
    if (tripID) fetchRooms();
  }, [tripID]);

  // Handle edit
  const handleEdit = (room) => {
    setSelectedRoom(room);
    setFormData({ sid: room.sid, locaid: room.locaid, price: room.price });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/trip-room/update`, {
        roomID: selectedRoom.roomid,
        ...formData,
      });
      setEditDialogOpen(false);
      fetchRooms();
    } catch (err) {
      console.error('Failed to update room:', err);
    }
  };

  // Handle delete
  const handleDelete = async (roomID) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/trip-room/delete`, { data: { roomID } });
      fetchRooms();
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  // Handle add
  const handleAdd = () => {
    setFormData({ roomNumber: '', sid: '', locaid: '', price: '' });
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trip-room/add`, {
        tripID,
        ...formData,
      });
      setAddDialogOpen(false);
      fetchRooms();
    } catch (err) {
      console.error('Failed to add room:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trip Rooms
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {rooms.map((room) => (
          <Box
            key={room.roomid}
            sx={{
              flex: '1 1 calc(30% - 16px)', // 50% width with a gap of 16px
              border: '1px solid #ddd',
              padding: 2,
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ListItemText
              primary={`Room ${room.roomnumber} (${room.stateroom_type})`}
              secondary={`Beds: ${room.bed}, Price: ${room.price}, Location: ${room.location_side}`}
            />
            <Box>
              <IconButton onClick={() => handleEdit(room)}>
                <Edit />
              </IconButton>
              {room.occupancy_status === 'N' && (
                <IconButton onClick={() => handleDelete(room.roomid)}>
                  <Delete />
                </IconButton>
              )}
            </Box>
          </Box>
        ))}
      </Box>
      <Box display="flex" justifyContent="center" mt={2}>
      <Button variant="contained" color="primary" onClick={handleAdd}>
        Add Room
      </Button>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={staterooms}
            getOptionLabel={(option) => option.type}
            value={staterooms.find((s) => s.sid === formData.sid) || null}
            onChange={(e, value) => setFormData({ ...formData, sid: value.sid })}
            renderInput={(params) => <TextField {...params} label="Stateroom Type" />}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            options={locations}
            getOptionLabel={(option) => option.location_side}
            value={locations.find((l) => l.locaid === formData.locaid) || null}
            onChange={(e, value) => setFormData({ ...formData, locaid: value.locaid })}
            renderInput={(params) => <TextField {...params} label="Location" />}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
        <DialogTitle>Add Room</DialogTitle>
        <DialogContent>
          <TextField
            label="Room Number"
            type="number"
            fullWidth
            value={formData.roomNumber}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            options={staterooms}
            getOptionLabel={(option) => option.type}
            onChange={(e, value) => setFormData({ ...formData, sid: value.sid })}
            renderInput={(params) => <TextField {...params} label="Stateroom Type" />}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            options={locations}
            getOptionLabel={(option) => option.location_side}
            onChange={(e, value) => setFormData({ ...formData, locaid: value.locaid })}
            renderInput={(params) => <TextField {...params} label="Location" />}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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

export default TripRoomManagement;
