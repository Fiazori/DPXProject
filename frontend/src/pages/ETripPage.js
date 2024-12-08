import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ENavBar from '../components/ENavBar';
import axios from 'axios';
import SearchTripForm from '../components/SearchTripForm';
import AddTripDialog from '../components/AddTripDialog';
import EditTripDialog from '../components/EditTripDialog';
import TripPackageList from '../components/TripPackageList';
import AddTripPackageForm from '../components/AddTripPackageForm';
import TripRestaurantList from '../components/TripRestaurantList';
import AddTripRestaurantForm from '../components/AddTripRestaurantForm';
import TripActivityList from '../components/TripActivityList';
import AddTripActivityForm from '../components/AddTripActivityForm';
import PortManagement from '../components/TripPortManagement';
import TripRoomManagement from '../components/TripRoomManagement';

const ETripAdminPage = () => {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isAddTripOpen, setAddTripOpen] = useState(false);
  const [isEditTripOpen, setEditTripOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const navigate = useNavigate();

  const tripRestaurantListRef = useRef();
  const tripPackageListRef = useRef();
  const tripActivityListRef = useRef();

  const fetchCurrentTrip = async (tripid) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trips/admin/findid`, {
        params: { tripid },
      });
      setCurrentTrip(response.data);
    } catch (err) {
      console.error('Failed to fetch current trip:', err);
    }
  };

  const handleSelectTrip = (trip) => {
    fetchCurrentTrip(trip);
    setSearchOpen(false);
  };

  const handleTripAdded = (trip) => {
    fetchCurrentTrip(trip);
    setAddTripOpen(false);
  };

  const handleTripUpdated = (updatedTrip) => {
    fetchCurrentTrip(updatedTrip.tripid);
    setEditTripOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = -100; // 上移 100px
      const topPosition = element.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: topPosition, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <ENavBar />
      <Box display="flex" sx={{ marginTop: '85px' }}>
        {/* 左侧侧边栏 */}
        <Box
          position="fixed"
          sx={{
            width: '300px',
            backgroundColor: '#f4f4f4',
            padding: '16px',
            borderRight: '1px solid #ddd',
            height: '100vh',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Trip Management
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={() => setSearchOpen(true)}>
            Search Trip
          </Button>
          <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 2 }} onClick={() => setAddTripOpen(true)}>
            Add Trip
          </Button>
          <AddTripDialog open={isAddTripOpen} onClose={() => setAddTripOpen(false)} onTripAdded={handleTripAdded} />

          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>
              Current Trip:
            </Typography>
            {currentTrip ? (
              <Box>
                <Typography variant="body1">ID: {currentTrip.tripid}</Typography>
                <Typography variant="body1">
                  {currentTrip.startPort} → {currentTrip.endPort}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Start Date: {formatDate(currentTrip.startDate)}
                </Typography>
                <Typography variant="body2" mt={1}>
                  End Date: {formatDate(currentTrip.endDate)}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Night: {currentTrip.night}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Active: {currentTrip.isActive === 'Y' ? 'Yes' : 'No'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setEditTripOpen(true)}
                >
                  Edit Trip
                </Button>
                <EditTripDialog
                  open={isEditTripOpen}
                  onClose={() => setEditTripOpen(false)}
                  currentTrip={currentTrip}
                  onTripUpdated={handleTripUpdated}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No trip selected.
              </Typography>
            )}
          </Box>
          {currentTrip && (
            <Box mt={4}>
              <Button
                variant="text"
                fullWidth
                onClick={() => scrollToSection('package-section')}
              >
                Manage Packages
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => scrollToSection('restaurant-section')}
              >
                Manage Restaurants
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => scrollToSection('activity-section')}
              >
                Manage Activities
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => scrollToSection('port-section')}
              >
                Manage Ports
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => scrollToSection('room-section')}
              >
                Manage Rooms
              </Button>
            </Box>
          )}
        </Box>

        {/* 右侧操作界面 */}
        <Box flex="1" padding="16px" sx={{ marginLeft: '330px' }}>
          {currentTrip ? (
            <>
              <Paper id="package-section" elevation={3} sx={{ mb: 4, p: 2, minHeight: '88vh' }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                  Manage Packages
                </Typography>
                <AddTripPackageForm
                  tripID={currentTrip.tripid}
                  onPackageAdded={() => tripPackageListRef.current?.fetchTripPackages()}
                />
                <TripPackageList ref={tripPackageListRef} tripID={currentTrip.tripid} />
              </Paper>

              <Paper id="restaurant-section" elevation={3} sx={{ mb: 4, p: 2, minHeight: '88vh' }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                  Manage Restaurants
                </Typography>
                <AddTripRestaurantForm
                  tripID={currentTrip.tripid}
                  onRestaurantAdded={() => tripRestaurantListRef.current?.fetchTripRestaurants()}
                />
                <TripRestaurantList
                  ref={tripRestaurantListRef}
                  tripID={currentTrip.tripid}
                  onRestaurantRemoved={() => fetchCurrentTrip(currentTrip.tripid)}
                />
              </Paper>

              <Paper id="activity-section" elevation={3} sx={{ mb: 4, p: 2, minHeight: '88vh' }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                  Manage Activities
                </Typography>
                <AddTripActivityForm
                  tripID={currentTrip.tripid}
                  onActivityAdded={() => tripActivityListRef.current?.fetchTripActivities()}
                />
                <TripActivityList ref={tripActivityListRef} tripID={currentTrip.tripid} />
              </Paper>

              <Paper id="port-section" elevation={3} sx={{ mb: 4, p: 2, minHeight: '88vh' }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                  Manage Ports
                </Typography>
                <PortManagement tripID={currentTrip.tripid} fetchCurrentTrip={fetchCurrentTrip} />
              </Paper>

              <Paper id="room-section" elevation={3} sx={{ mb: 4, p: 2, minHeight: '88vh' }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                  Manage Rooms
                </Typography>
                <TripRoomManagement tripID={currentTrip.tripid} />
              </Paper>
            </>
          ) : (
            <Typography variant="h6" color="textSecondary" align="center" mt={8}>
              Select a trip first to manage its details.
            </Typography>
          )}
        </Box>
      </Box>

      {/* 搜索弹窗 */}
      <Dialog open={isSearchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Search Trip</DialogTitle>
        <DialogContent>
          <SearchTripForm onSelectTrip={handleSelectTrip} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ETripAdminPage;
