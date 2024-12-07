import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button, Modal, List, ListItem, ListItemText, IconButton } from '@mui/material';
import axios from 'axios';
import { getToken } from '../util/auth';
import { jwtDecode } from 'jwt-decode';
import NavBar from '../components/NavBar';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Add as AddIcon } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

const SelectRoomPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const groupid = searchParams.get('groupid');
    const tripid = searchParams.get('tripid');
    const [error, setError] = useState('');
    const token = getToken();
    const user = token ? jwtDecode(token) : null;
    const [highlightRooms, setHighlightRooms] = useState({});
    const [passengers, setPassengers] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [addedRooms, setAddedRooms] = useState([]); // 已添加的房间
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

const fetchGroupRooms = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/rooms/group-rooms`, {
            params: { groupid },
        });
        setAddedRooms(response.data);
    } catch (err) {
        console.error('Failed to fetch group rooms:', err);
    }
};

// Move fetchPassengers to be a standalone function
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

// Update useEffect to use the fetchPassengers function
useEffect(() => {
    if (!groupid) {
        console.warn('Group ID is missing, skipping fetch.');
        return;
    }

    const fetchData = async () => {
        await Promise.all([fetchPassengers(), fetchGroupRooms()]);
    };

    fetchData();
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
                groupid: groupid,
                status: 'Y',
            });
            setError('');
            await fetchGroupRooms(); // 重新获取已分配房间的数据
            await fetchRoomTypes(); // 重新获取房型数据
            setSelectedRoomType(null); // 清空上一次的选择
            setRooms([]);
        } catch (err) {
            console.error('Failed to occupy room:', err);
            setError('Failed to add room. It may have been occupied by another user. Please try another room.');
        }
    };
    
    const handleDeletePassenger = async (passengerid) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rooms/delete-passenger`, {
                passengerid,
                groupid,
            });
            await fetchPassengers(); // Refresh the passenger list after deletion
            await fetchGroupRooms(); // Refresh the group rooms if necessary
        } catch (err) {
            console.error('Failed to delete passenger:', err);
            setError('Failed to delete passenger. Please try again.');
        }
    };
    
    
    const handleRemoveRoom = async (roomid) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rooms/remove`, { roomid });
            await fetchGroupRooms(); // 重新获取房间和乘客数据
        } catch (err) {
            console.error('Failed to remove room:', err);
        }
    };
    
    const handleRemovePassenger = async (passengerid) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rooms/remove-passenger`, { passengerid });
            await fetchGroupRooms(); // 重新获取房间和乘客数据
        } catch (err) {
            console.error('Failed to remove passenger from room:', err);
        }
    };
    

    const handlePassengerDrop = async (passenger, roomid) => {
        const room = addedRooms.find((r) => r.roomid === roomid);

        if (room.passengers.length >= room.bed) {
            // 设置需要高亮的房间
            setHighlightRooms((prev) => ({ ...prev, [roomid]: true }));
            setTimeout(() => {
                setHighlightRooms((prev) => {
                    const { [roomid]: _, ...rest } = prev; // 清除高亮状态
                    return rest;
                });
            }, 1000); // 3秒后清除高亮
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rooms/assign-passenger`, {
                roomid,
                passengerid: passenger.passengerid, // 这里使用 passengerid
            });
            await fetchGroupRooms(); // 重新获取房间和乘客数据
        } catch (err) {
            console.error('Failed to assign passenger to room:', err);
        }
    };
    
    
const handleNext = () => {
    if (addedRooms.some((room) => room.passengers.length === 0)) {
        setErrorMessage('Each room must have at least one passenger.');
        return;
    }
    setErrorMessage(''); // 清除错误
    navigate(`/add-package?groupid=${groupid}&tripid=${tripid}`);
};
    return (
        <Box>
            <NavBar />
            <Sidebar />
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
        <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={passenger.passinfoid}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('passenger', JSON.stringify(passenger))}
        >
            <Card
                sx={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                    position: 'relative',
                }}
            >
                <CardContent>
                    <Typography variant="h6">
                        {passenger.fname} {passenger.lname}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {passenger.email}
                    </Typography>
                    {/* Delete Button */}
                    <IconButton
                        onClick={() => handleDeletePassenger(passenger.passengerid)}
                        sx={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: '#ffcccc',
                            '&:hover': {
                                backgroundColor: '#ff6666',
                            },
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </CardContent>
            </Card>
        </Grid>
    ))}
</Grid>



                
<Box sx={{ display: 'flex', alignItems: 'center', marginTop: '50px', marginBottom: '30px'}}>
    <Typography variant="h6" sx={{ marginRight: '10px' }}>
        Rooms:
    </Typography>
    <IconButton
        onClick={() => {
            setModalOpen(true);
            fetchRoomTypes();
            setSelectedRoomType(null);
            setRooms([]);
        }}
        sx={{
            backgroundColor: '#999999',
            color: 'white',
            padding: '12px',
            borderRadius: '30%', // 圆形按钮
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                backgroundColor: '#00bfff',
            },
        }}
    >
        <AddIcon />
    </IconButton>
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
                                        secondary={`${roomType.bed} beds - Starting at $${roomType.minPrice}`}
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
                    height: '90%',
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



                <Grid container spacing={2} >
    {addedRooms.map((room) => (
        <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={room.roomid}
            onDrop={(e) => {
                const passenger = JSON.parse(e.dataTransfer.getData('passenger'));
                handlePassengerDrop(passenger, room.roomid);
            }}
            onDragOver={(e) => e.preventDefault()}
        >
            <Card sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                <CardContent>
                <Typography
            variant="h6"
            sx={{
                color: highlightRooms[room.roomid] ? 'red' : 'inherit', // 高亮变红
                transition: 'color 0.3s ease',
            }}
        >
            Room #{room.roomnumber} ({room.passengers.length}/{room.bed})
        </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Facing: {room.location_side}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Type: {room.type}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Price: ${room.price}
                    </Typography>

                    {/* 显示乘客列表 */}
                    <Typography variant="body1" sx={{ marginTop: '10px' }}>
                        Passengers:
                    </Typography>
                    <ul>
    {room.passengers.map((p) => (
        <li key={p.passengerid}>
            {p.fname} {p.lname}
            <IconButton onClick={() => handleRemovePassenger(p.passengerid)}>
                <DeleteIcon />
            </IconButton>
        </li>
    ))}
</ul>

<Button
    onClick={() => handleRemoveRoom(room.roomid)}
    sx={{
        display: 'block', // 使按钮以块级元素居中
        margin: '0 auto', // 自动设置左右外边距居中
        marginTop: '20px', // 增加顶部间距
    }}
>
    Delete Room
</Button>


                </CardContent>
            </Card>
        </Grid>
    ))}
</Grid>

<Box sx={{ margin: '20px 0', textAlign: 'center' }}>
    {errorMessage && (
        <Typography color="error" variant="body1">
            {errorMessage}
        </Typography>
    )}
</Box>

<Box sx={{ textAlign: 'center', marginTop: '30px' }}>
    <Button
        variant="contained"
        onClick={handleNext}
        sx={{
            padding: '16px 32px',
            fontSize: '18px',
            marginTop: '20px',
        }}
    >
        Next
    </Button>
</Box>


            </Box>
        </Box>
    );
};

export default SelectRoomPage;
