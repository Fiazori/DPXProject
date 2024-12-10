import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import ENavBar from '../components/ENavBar';
import axios from 'axios';

const EUserPage = () => {
  const [tripID, setTripID] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchPassengers = async () => {
    if (!tripID) {
      setError('Please enter a Trip ID');
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trip-passenger/passengers`, {
        params: { tripid: tripID },
      });
      setGroups(response.data);
    } catch (err) {
      console.error('Error fetching passengers:', err);
      setError('Failed to fetch passengers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '16px', minHeight: '90vh', marginTop: '90px' }}>
      <ENavBar />
      <Box sx={{ textAlign: 'center', marginBottom: '24px' }}>
        <Typography variant="h4" gutterBottom>
          Manage Passengers
        </Typography>
        <Box sx={{ display: 'inline-flex', gap: '16px', marginBottom: '16px' }}>
          <TextField
            label="Trip ID"
            value={tripID}
            onChange={(e) => setTripID(e.target.value)}
            sx={{ width: '300px' }}
          />
          <Button variant="contained" color="primary" onClick={handleFetchPassengers}>
            Search
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ textAlign: 'center', marginBottom: '16px' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading && (
        <Typography variant="body1" color="textSecondary" textAlign="center">
          Loading passengers...
        </Typography>
      )}

      {!loading && groups.length > 0 && (
        <Box sx={{ marginTop: '16px' }}>
          {groups.map((group) => (
            <Box key={group.groupid} sx={{ marginBottom: '32px' }}>
              <Typography variant="h5" gutterBottom>
                Group ID: {group.groupid} (Size: {group.group_size})
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Passenger ID</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Birthdate</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Nationality</TableCell>
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.passengers.map((passenger) => (
                      <TableRow key={passenger.passengerid}>
                        <TableCell>{passenger.passengerid}</TableCell>
                        <TableCell>{passenger.fname}</TableCell>
                        <TableCell>{passenger.lname}</TableCell>
                        <TableCell>{new Date(passenger.birthdate).toLocaleDateString()}</TableCell>
                        <TableCell>{passenger.email}</TableCell>
                        <TableCell>{passenger.phone}</TableCell>
                        <TableCell>{passenger.gender}</TableCell>
                        <TableCell>{passenger.nationality}</TableCell>
                        <TableCell>
                          {`${passenger.street}, ${passenger.city}, ${passenger.state}, ${passenger.country}, ${passenger.zipcode}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      )}

      {!loading && groups.length === 0 && tripID && !error && (
        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ marginTop: '16px' }}>
          No passengers found for the given Trip ID.
        </Typography>
      )}
    </Box>
  );
};

export default EUserPage;
