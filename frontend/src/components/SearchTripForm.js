import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, Card, CardActionArea } from '@mui/material';
import axios from 'axios';

const SearchTripForm = ({ onSelectTrip }) => {
    const [startPort, setStartPort] = useState('');
    const [TripID, setTripID] = useState('');
    const [endPort, setEndPort] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [night, setNight] = useState('');
    const [results, setResults] = useState([]);

    // 时间格式转换函数
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date); // en-CA 默认 yyyy-mm-dd 格式
    };

    const handleSearch = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trips/admin/find`, {
                TripID,
                startPort,
                endPort,
                startDate,
                endDate,
                night,
            });
            const formattedResults = response.data.map((trip) => ({
                ...trip,
                startDate: formatDate(trip.startDate),
                endDate: formatDate(trip.endDate),
            }));
    
            setResults(formattedResults);
        } catch (err) {
            console.error('Failed to search trips:', err);
        }
    };
{/* <ThemeProvider theme={localTheme}></ThemeProvider> */}
    return (
        <Box>
            {/* 搜索表单 */}
            
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <TextField
                    label="Trip ID"
                    value={TripID}
                    onChange={(e) => setTripID(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Start Port"
                    value={startPort}
                    onChange={(e) => setStartPort(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="End Port"
                    value={endPort}
                    onChange={(e) => setEndPort(e.target.value)}
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
                    fullWidth
                />
            </Box>
            <Button variant="contained" color="primary" onClick={handleSearch} fullWidth>
                Search
            </Button>

            {/* 搜索结果 */}
            <Box mt={4}>
                {results.length === 0 ? (
                    <Typography variant="body1" textAlign="center" color="textSecondary">
                        No trips found.
                    </Typography>
                ) : (
                    <Grid container spacing={2}>
                        {results.map((trip) => (
                            <Grid item xs={12} sm={6} key={trip.tripid}>
                                <Card>
                                    <CardActionArea onClick={() => onSelectTrip(trip.tripid)}>
                                        <Box padding={2}>
                                            <Typography variant="body1">
                                                ID: {trip.tripid}
                                            </Typography>
                                            <Typography variant="h6">
                                                {trip.startPort} → {trip.endPort}
                                            </Typography>
                                            <Typography variant="body2">
                                                Start Date:
                                                <br />
                                                {trip.startDate}
                                            </Typography>
                                            <Typography variant="body2" mt={1}>
                                                End Date:
                                                <br />
                                                {trip.endDate}
                                            </Typography>
                                            <Typography variant="body2" mt={1}>
                                                Night:
                                                {trip.night}
                                            </Typography>
                                            <Typography variant="body2" mt={1}>
                                                Active: {trip.isActive === 'Y' ? 'Yes' : 'No'}
                                            </Typography>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default SearchTripForm;
