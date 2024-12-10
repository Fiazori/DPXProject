import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Typography, TextField, List, ListItem, ListItemText, Divider, Modal, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../util/auth';
import { jwtDecode } from 'jwt-decode';
import NavBar from '../components/NavBar';

const PassengerSelectionPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tripid = searchParams.get('tripid');

    const token = getToken();
    const user = token ? jwtDecode(token) : null;

    const [savedPassengers, setSavedPassengers] = useState([]);
    const [selectedPassengers, setSelectedPassengers] = useState([]);
    const [newPassenger, setNewPassenger] = useState({
        fname: '',
        lname: '',
        birthdate: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        gender: '',
        nationality: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [openModal, setOpenModal] = useState(false);

    // Fetch saved passengers
    useEffect(() => {
        if (!user || !user.user_id) {
            console.error('User ID not found in token');
            navigate('/login');
            return null;
        }

        const fetchSavedPassengers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/passenger/saved?userid=${user.user_id}`);
                setSavedPassengers(response.data);
            } catch (err) {
                console.error('Failed to fetch saved passengers:', err);
            }
        };
        fetchSavedPassengers();
    }, [user?.user_id]);

    // Validate new passenger form
    const validateForm = () => {
        const newErrors = {};
        Object.keys(newPassenger).forEach((key) => {
            if (!newPassenger[key]) {
                newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Add new passenger
    const handleCreatePassenger = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/passenger/create`, newPassenger);
            const passinfoid = response.data.passinfoid;

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/passenger/save`, { passinfoid, userid: user.user_id });
            setSavedPassengers([...savedPassengers, { ...newPassenger, passinfoid }]);

            setOpenModal(false);
            setNewPassenger({
                fname: '',
                lname: '',
                birthdate: '',
                street: '',
                city: '',
                state: '',
                country: '',
                zipcode: '',
                gender: '',
                nationality: '',
                email: '',
                phone: '',
            });
        } catch (err) {
            console.error('Failed to create passenger info:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete passenger
    const handleDeletePassenger = async (passinfoid) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/passenger/delete`, {
                data: { userid: user.user_id, passinfoid },
            });
            setSavedPassengers(savedPassengers.filter((p) => p.passinfoid !== passinfoid));
        } catch (err) {
            console.error('Failed to delete passenger:', err);
        }
    };

    // Select passengers
    const toggleSelectPassenger = (passinfoid) => {
        setSelectedPassengers((prev) =>
            prev.includes(passinfoid)
                ? prev.filter((id) => id !== passinfoid)
                : [...prev, passinfoid]
        );
    };

    // Proceed to Select Room Page
    const handleSelectRoom = async () => {
        try {
            // Create group
            const groupResponse = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/group/create`, {
                tripid,
                group_size: selectedPassengers.length,
            });
            const groupid = groupResponse.data.groupid;

            // Navigate to the next page immediately
            navigate(`/select-room?groupid=${groupid}&tripid=${tripid}`);

            // Assign passengers to the group asynchronously
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/group/assign`, {
                groupid,
                passengers: selectedPassengers.map((passinfoid) => ({ passinfoid })),
            });
        } catch (err) {
            console.error('Failed to proceed to select room:', err);
        }
    };

    return (
        <Box>
            <NavBar />
            <Box sx={{ maxWidth: '800px', margin: 'auto', marginTop: '120px' }}>
                <Typography variant="h4" textAlign="center" gutterBottom>
                    Add Passenger to Your Group
                </Typography>
                <Divider sx={{ my: 3 }} />
                <List>
                    <ListItem
                        button
                        onClick={() => setOpenModal(true)}
                        sx={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        <ListItemText
                            primary={
                                <Typography variant="h6" color="primary">
                                    + Add New Passenger
                                </Typography>
                            }
                        />
                    </ListItem>
                    {savedPassengers.map((passenger) => (
                        <ListItem
                            key={passenger.passinfoid}
                            button
                            onClick={() => toggleSelectPassenger(passenger.passinfoid)}
                            sx={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                backgroundColor: selectedPassengers.includes(passenger.passinfoid) ? '#f0f8ff' : 'white',
                            }}
                        >
                            <ListItemText
                                primary={`${passenger.fname} ${passenger.lname}`}
                                secondary={`Email: ${passenger.email}, Phone: ${passenger.phone}`}
                            />
                            <IconButton
                                edge="end"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePassenger(passenger.passinfoid);
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSelectRoom}
                        disabled={selectedPassengers.length === 0}
                    >
                        Select Room
                    </Button>
                </Box>
            </Box>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: 'background.paper',
                        borderRadius: '8px',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Add New Passenger
                    </Typography>
                    <Box
                        component="form"
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 2,
                        }}
                    >
                        {Object.keys(newPassenger).map((field) => (
                            <TextField
                                key={field}
                                label={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={newPassenger[field]}
                                onChange={(e) => setNewPassenger({ ...newPassenger, [field]: e.target.value })}
                                fullWidth
                                error={!!errors[field]}
                                helperText={errors[field] || ''}
                                type={field === 'birthdate' ? 'date' : 'text'}
                                InputLabelProps={field === 'birthdate' ? { shrink: true } : {}}
                            />
                        ))}
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreatePassenger}
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
};

export default PassengerSelectionPage;
