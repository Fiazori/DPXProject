import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, Button, Grid, Chip } from '@mui/material';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PackagePage = () => {
    const [searchParams] = useSearchParams();
    const groupid = searchParams.get('groupid');
    const tripid = searchParams.get('tripid');
    const navigate = useNavigate();
    const [passengers, setPassengers] = useState([]);
    const [tripPackages, setTripPackages] = useState([]);
    const [passengerPackages, setPassengerPackages] = useState({}); // { passengerid: [{ trippackid, packtype }] }

    // Fetch group passengers
    useEffect(() => {
        const fetchPassengers = async () => {
            if (!groupid) return;
            const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/package/group-passengers?groupid=${groupid}`);
            setPassengers(data);
        };

        fetchPassengers();
    }, [groupid]);

    // Fetch trip packages
    useEffect(() => {
        const fetchTripPackages = async () => {
            if (!tripid) return;
            const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/package/trip-packages?tripid=${tripid}`);
            setTripPackages(data);
        };

        fetchTripPackages();
    }, [tripid]);

    // Fetch selected packages for each passenger
    const fetchPassengerPackages = async (passengerid) => {
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/package/passenger-packages?passengerid=${passengerid}`);
        setPassengerPackages((prev) => ({ ...prev, [passengerid]: data }));
    };

    useEffect(() => {
        const fetchAllPassengerPackages = async () => {
            if (!passengers.length) return;
            for (const passenger of passengers) {
                await fetchPassengerPackages(passenger.passengerid);
            }
        };
    
        fetchAllPassengerPackages();
    }, [passengers]); // 当 passengers 数据变化时触发
    

    // Add package
    const handleAddPackage = async (passengerid, trippackid) => {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/package/add-package`, { passengerid, trippackid });
        fetchPassengerPackages(passengerid);
    };

    // Remove package
    const handleRemovePackage = async (passengerid, trippackid) => {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/package/remove-package`, { passengerid, trippackid });
        fetchPassengerPackages(passengerid);
    };

    return (
        <Box>
        <NavBar />
        <Sidebar />
        <Box sx={{ maxWidth: '1800px', margin: 'auto', marginTop: '120px' }}>
            <Typography variant="h4" textAlign="center">
                Select Packages for Your Group
            </Typography>
            <Grid container spacing={3} sx={{ marginTop: '20px' }}>
                {passengers.map((passenger) => (
                    <Grid item xs={12} sm={6} key={passenger.passengerid}>
                        <Card sx={{ padding: '20px', border: '1px solid #ddd' }}>
                            {/* Passenger Name */}
                            <Typography variant="h5" fontWeight="bold" sx={{ marginBottom: '10px' }}>
                                {passenger.fname} {passenger.lname}
                            </Typography>

                            <Grid container spacing={3} sx={{ marginTop: '10px' }}>
                                {/* Selected Packages */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Selected Packages:
                                    </Typography>
                                    <Box minHeight= '50px'>
                                        {passengerPackages[passenger.passengerid]?.map((pkg) => (
                                            <Chip
                                                key={pkg.trippackid}
                                                label={`${pkg.packtype}`}
                                                onDelete={() => handleRemovePackage(passenger.passengerid, pkg.trippackid)}
                                                sx={{ marginRight: '5px', marginBottom: '5px' }}
                                            />
                                        ))}
                                    </Box>
                                </Grid>

                                {/* Available Packages */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Available Packages:
                                    </Typography>
                                    <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
                                        {tripPackages.map((pkg) => (
                                            <Card
                                                key={pkg.trippackid}
                                                sx={{
                                                    marginBottom: '10px',
                                                    padding: '10px',
                                                    border: '1px solid #ddd',
                                                }}
                                            >
                                                <Typography variant="body1" fontWeight="bold">
                                                    {pkg.packtype}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    ${pkg.packcost} ({pkg.pricing_type})
                                                </Typography>
                                                <Button
    variant="outlined"
    sx={{ marginTop: '10px' }}
    onClick={() => handleAddPackage(passenger.passengerid, pkg.trippackid)}
    disabled={
        (passengerPackages[passenger.passengerid] || []).some((selected) => selected.trippackid === pkg.trippackid)
    }
>
    Add
</Button>

                                            </Card>
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
        <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
    <Button
        variant="contained"
        size="large"
        onClick={() => navigate(`/invoice?groupid=${groupid}&tripid=${tripid}`)}
        sx={{
            backgroundColor: '#007bff',
            color: '#fff',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                backgroundColor: '#0056b3',
            },
        }}
    >
        Next
    </Button>
</Box>
<Box sx={{ textAlign: 'center', marginTop: '50px' }}></Box>
        </Box>
    );
};

export default PackagePage;
