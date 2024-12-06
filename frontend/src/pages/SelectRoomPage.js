import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button, Modal, List, ListItem, ListItemText, IconButton } from '@mui/material';
import axios from 'axios';
import { getToken } from '../util/auth';
import { jwtDecode } from 'jwt-decode';
import NavBar from '../components/NavBar';
import { Delete as DeleteIcon } from '@mui/icons-material';

const SelectRoomPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const groupid = searchParams.get('groupid');
    const [error, setError] = useState('');
    const token = getToken();
    const user = token ? jwtDecode(token) : null;

    const [passengers, setPassengers] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [addedRooms, setAddedRooms] = useState([]); // 已添加的房间
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!groupid) {
            console.warn('Group ID is missing, skipping fetch.');
            return;
        }

        const fetchPassengers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/group/passengers?groupid=${groupid}`);
                setPassengers(response.data);
            } catch (err) {
                console.error('Failed to fetch passengers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPassengers();
    }, [groupid]);

    const fetchRoomTypes = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/rooms/types?groupid=${groupid}`);
            setRoomTypes(response.data);
        } catch (err) {
            console.error('Failed to fetch room types:', err);
        }
    };

    const fetchRooms = async (sid) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/rooms/available`, {
                params: { groupid, sid },
            });
            setRooms(response.data);
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
        }
    };

    const handleAddRoom = async (room) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rooms/occupy`, {
                roomid: room.roomid,
                status: 'Y',
            });
            setAddedRooms((prev) => [...prev, room]);
            setError(''); // 清除错误
            // 重新获取房间数据
            if (selectedRoomType) {
                await fetchRooms(selectedRoomType.sid);
            }
        } catch (err) {
            console.error('Failed to occupy room:', err);
            setError('Failed to add room. It may have been occupied by another user. Please try another room.');
        }
    };
    
    const handleRemoveRoom = (roomid) => {
        setAddedRooms((prev) => prev.filter((room) => room.roomid !== roomid));
        // 释放房间状态
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/rooms/occupy`, {
            roomid,
            status: 'N',
        });
    };

    return (
        <Box>
            <NavBar />
            <Box sx={{ maxWidth: '1200px', margin: 'auto', marginTop: '130px', padding: '20px' }}>
                <Typography variant="h4" textAlign="center" gutterBottom>
                    Select Rooms for Your Group
                </Typography>

                {/* Passenger List */}
                <Typography variant="h6" gutterBottom>
                    Group Passengers:
                </Typography>
                <Grid container spacing={2}>
                    {passengers.map((passenger) => (
                        <Grid item xs={12} sm={6} md={4} key={passenger.passinfoid}>
                            <Card sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: '#f9f9f9' }}>
                                <CardContent>
                                    <Typography variant="h6">
                                        {passenger.fname} {passenger.lname}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {passenger.email}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Add Room Button */}
                <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => {
                            setModalOpen(true);
                            await fetchRoomTypes(); // 重新获取房型数据
                            setSelectedRoomType(null); // 清空上一次的选择
                            setRooms([]); // 清空上一次的房间数据
                        }}
                    >
                        Add Room
                    </Button>

                </Box>

                {/* Modal for Room Selection */}
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            bgcolor: 'background.paper',
                            borderRadius: '8px',
                            p: 4,
                        }}
                    >
                        <Typography variant="h6">Available Room Types</Typography>
                        <List>
                            {roomTypes.map((roomType) => (
                                <ListItem
                                    key={roomType.sid}
                                    button
                                    onClick={() => {
                                        setSelectedRoomType(roomType);
                                        fetchRooms(roomType.sid);
                                    }}
                                >
                                    <ListItemText
                                        primary={`${roomType.type} - ${roomType.emptyRooms} Available`}
                                        secondary={`Starting at $${roomType.minPrice}`}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        {selectedRoomType && (
                            <>
                                <Typography variant="h6" sx={{ marginTop: '20px' }}>
                                    Rooms for {selectedRoomType.type}
                                </Typography>
                                <Grid container spacing={2}>
    {rooms.map((room) => (
        <Grid item xs={12} sm={6} md={4} key={room.roomid}>
            <Card
                sx={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '100%',
                }}
            >
                <CardContent sx={{ flex: '1' }}>
                    <Typography variant="h5" sx={{  marginBottom: '10px' }}>
                        Room #{room.roomnumber}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', marginBottom: '10px' }}>
                        Facing: {room.location_side}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Price: ${room.price}
                    </Typography>
                </CardContent>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddRoom(room)}
                    sx={{
                        height: '50px',
                        marginRight: '50px',
                    }}
                >
                    Add Room
                </Button>
            </Card>
        </Grid>
    ))}
</Grid>

                            </>
                        )}
                    </Box>
                </Modal>

                {/* Added Rooms */}
                <Typography variant="h6" sx={{ marginTop: '30px' }}>
                    Added Rooms:
                </Typography>
                <Grid container spacing={2}>
                    {addedRooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} key={room.roomid}>
                            <Card sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: '#f0f8ff' }}>
                                <CardContent>
                                    <Typography variant="h6">Room #{room.roomnumber}</Typography>
                                    <Typography variant="body2">Facing: {room.location_side}</Typography>
                                    <Typography variant="body2">Price: ${room.price}</Typography>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleRemoveRoom(room.roomid)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default SelectRoomPage;