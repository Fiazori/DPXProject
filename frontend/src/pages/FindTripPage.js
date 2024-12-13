import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, DialogActions  } from '@mui/material';
import NavBar from '../components/NavBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FindTripPage = () => {
    const [startPort, setStartPort] = useState('');
    const [endPort, setEndPort] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [night, setNight] = useState('');
    const [trips, setTrips] = useState([]);
    const [error, setError] = useState('');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripDetails, setTripDetails] = useState(null); 
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const navigate = useNavigate();

    // 查询行程
    const handleSearch = async () => {
        setError('');
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trips/find`, {
                startPort,
                endPort,
                startDate,
                endDate,
                night: night ? parseInt(night, 10) : null,
            });
            setTrips(response.data); // 设置查询到的行程
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to fetch trips');
        }
    };

    const handleCardClick = async (trip) => {
        setSelectedTrip(trip);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trips/get-detail`, {
                params: { tripid: trip.tripid },
            });
            setTripDetails(response.data);
            setIsDialogOpen(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to fetch trip details');
        }
    };
    
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTripDetails(null);
    };

    return (
        <Box>
            <NavBar />
            <Box sx={{ maxWidth: '1800px', margin: 'auto', padding: '20px', marginTop: '120px' }}>
                <Typography variant="h4" mb={3} textAlign="center">
                    Find Your Perfect Trip
                </Typography>
                <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
    <DialogTitle>Trip Details</DialogTitle>
    <DialogContent>
        {tripDetails ? (
            <Box>
                <Typography variant="h6">{selectedTrip.start_port_name} → {selectedTrip.end_port_name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {new Date(selectedTrip.startdate).toLocaleDateString()} - {new Date(selectedTrip.enddate).toLocaleDateString()}
                </Typography>
                <Typography variant="h6">Activities:</Typography>
                {tripDetails.activities.length > 0 ? (
                    tripDetails.activities.map((activity) => (
                        <Typography variant="body2" key={activity.actID}>
                            {activity.actName}  Floors: {activity.floors.join(', ')}
                        </Typography>
                    ))
                ) : (
                    <Typography variant="body2">No activities available.</Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Restaurants:</Typography>
                {tripDetails.restaurants.length > 0 ? (
                    tripDetails.restaurants.map((restaurant) => (
                        <Typography variant="body2" key={restaurant.resID}>
                            {restaurant.resName} ({restaurant.resType}), Open: {restaurant.resStarttime} - {restaurant.resEndtime}, Floor: {restaurant.resFloor}
                        </Typography>
                    ))
                ) : (
                    <Typography variant="body2">No restaurants available.</Typography>
                )}
            </Box>
        ) : (
            <Typography>Loading...</Typography>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleCloseDialog} color="secondary">Close</Button>
        <Button onClick={() => navigate(`/passenger-selection?tripid=${selectedTrip.tripid}`)} color="primary" variant="contained">
            Select
        </Button>
    </DialogActions>
</Dialog>

            {/* 搜索区域 */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
                    gap: 2,
                    alignItems: 'center',
                    marginBottom: '10px',
                }}
            >
                <TextField
                    label="Start Port"
                    value={startPort}
                    onChange={(e) => setStartPort(e.target.value)}
                    placeholder="Enter start port"
                    fullWidth
                />
                <TextField
                    label="End Port"
                    value={endPort}
                    onChange={(e) => setEndPort(e.target.value)}
                    placeholder="Enter end port"
                    fullWidth
                />
                <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="Nights"
                    type="number"
                    value={night}
                    onChange={(e) => setNight(e.target.value)}
                    placeholder="Enter number of nights"
                    fullWidth
                />
            </Box>
        </Box>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px',
            }}
        >
            <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                sx={{
                    padding: '10px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    maxWidth: '800px',
                    width: '100%', // 确保按钮在小屏幕下拉伸到容器宽度
                }}
            >
                Search Trips
            </Button>
        </Box>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px',
            }}
        >

            {/* 错误提示 */}
            {error && (
                <Typography variant="body1" color="error" mt={2} textAlign="center">
                    {error}
                </Typography>
            )}

            {/* 行程结果展示 */}
            <Box sx={{ width: '70%', marginTop: '30px' }}>
                {trips.length === 0 ? (
                    <Typography variant="body1" textAlign="center" color="textSecondary">
                        No trips found.
                    </Typography>
                ) : (
                    <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ marginBottom: '20px' }}>
                        Found {trips.length} trips.
                    </Typography>
                )}
{trips.length === 1 ? (
    <Grid container spacing={3} sx={{ width: '50%', margin: '0 auto', justifyContent: 'center' }}>
        <Grid item xs={12} sm={8}
        onClick={() => navigate(`/passenger-selection?tripid=${trips[0].tripid}`)}>
            <Card sx={{ display: 'flex', flexDirection: 'row', p: 2, 
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', borderRadius: '12px',
                        }}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        {trips[0].start_port_name} → {trips[0].end_port_name}
                    </Typography>
                    <Typography variant="body1">{trips[0].night} Nights</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {new Date(trips[0].startdate).toLocaleDateString()} - {new Date(trips[0].enddate).toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                        Stops: 
                    </Typography>
                    <Typography variant="body2">
                        {trips[0].ports ? trips[0].ports.split(', ').join(' → ') : ''}
                    </Typography>
                </Box>
            </Card>
        </Grid>
    </Grid>
) : (
    <Grid container spacing={3} sx={{ width: '80%', margin: '0 auto' }}>
        {trips.map((trip) => {
            const portsArray = trip.ports ? trip.ports.split(', ') : [];
            return (
                <Grid item xs={12} sm={6} key={trip.tripid}
                onClick={() => handleCardClick(trip)}>
                    <Card sx={{ display: 'flex', flexDirection: 'row', p: 2, 
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', borderRadius: '12px',
                                }}>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                {trip.start_port_name} → {trip.end_port_name}
                            </Typography>
                            <Typography variant="body1">{trip.night} Nights</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {new Date(trip.startdate).toLocaleDateString()} - {new Date(trip.enddate).toLocaleDateString()}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2">
                                Stops: 
                            </Typography>
                            <Typography variant="body2">
                                {portsArray.join(' → ')}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            );
        })}
    </Grid>
)}



                </Box>
            </Box>
        </Box>
    );
};

export default FindTripPage;
