import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import { getToken } from '../util/auth';
import { jwtDecode } from 'jwt-decode';
import NavBar from '../components/NavBar';

const ManageTrip = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getToken();
        const user = token ? jwtDecode(token) : null;

        if (!user || !user.user_id) {
            console.error('User ID not found in token');
            navigate('/login');
            return null;
        }

        const fetchGroups = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/group/saved?userid=${user.user_id}`);
                const savedPassengers = response.data;

                // 提取关联的 groupid 和 tripid
                const uniqueGroups = {};
                for (const passenger of savedPassengers) {
                    const { groupid, tripid } = passenger;
                    if (!uniqueGroups[groupid]) {
                        uniqueGroups[groupid] = { groupid, tripid, passengers: [] };
                    }
                    uniqueGroups[groupid].passengers.push(passenger);
                }

                const groupsWithDetails = await Promise.all(
                    Object.values(uniqueGroups).map(async (group) => {
                        try {
                            const { data: tripDetails } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trips/findid`, {
                                params: { tripid: group.tripid },
                            });
                            return { ...group, tripDetails };
                        } catch (err) {
                            console.error(`Failed to fetch trip details for tripid: ${group.tripid}`, err);
                            return { ...group, tripDetails: null };
                        }
                    })
                );

                setGroups(groupsWithDetails);
            } catch (err) {
                console.error('Failed to fetch saved passengers:', err);
                setError('Failed to fetch trips. Please try again later.');
            }
        };

        fetchGroups();
    }, [navigate]);

    return (
        <Box>
            <NavBar />

        <Box sx={{ maxWidth: '1200px', margin: 'auto', marginTop: '120px', padding: '20px' }}>
            <Typography variant="h4" textAlign="center" gutterBottom>
                Manage Your Trips
            </Typography>
            {error && (
                <Typography color="error" textAlign="center" sx={{ marginBottom: '20px' }}>
                    {error}
                </Typography>
            )}
            <Grid container spacing={3}>
                {groups.map((group) => (
                    <Grid item xs={12} sm={6} md={4} key={group.groupid}>
                        <Card
                            sx={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                            onClick={() => navigate(`/select-room?groupid=${group.groupid}&tripid=${group.tripid}`)}
                        >
                            <CardContent>


                                {/* 显示 Trip 详细信息 */}
                                {group.tripDetails ? (
                                    <>
                                        <Typography variant="h6" gutterBottom>
                                            {group.tripDetails.startPort} → {group.tripDetails.endPort}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            {new Date(group.tripDetails.startDate).toLocaleDateString()} -{' '}
                                            {new Date(group.tripDetails.endDate).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Ports: {group.tripDetails.ports}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography color="error" variant="body2">
                                        Failed to load trip details.
                                    </Typography>
                                )}

                                {/* 显示 Group 的乘客列表 */}
                                <Typography variant="body1" sx={{ marginTop: '10px' }}>
                                    Passengers:
                                </Typography>
                                <ul>
                                    {group.passengers.map((passenger) => (
                                        <li key={passenger.passinfoid}>
                                            {passenger.fname} {passenger.lname}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
        </Box>
    );
};

export default ManageTrip;
