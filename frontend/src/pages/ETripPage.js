import React, { useState, useRef } from 'react';
import { Box, Button, Typography, Dialog, DialogContent, DialogTitle, Grid, Card, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ENavBar from '../components/ENavBar';
import axios from 'axios';
import SearchTripForm from '../components/SearchTripForm'; // 搜索trip组件
import AddTripDialog from '../components/AddTripDialog'; // 添加trip组件
import EditTripDialog from '../components/EditTripDialog'; // 更改trip组件
import TripPackageList from '../components/TripPackageList';
import AddTripPackageForm from '../components/AddTripPackageForm';
import TripRestaurantList from '../components/TripRestaurantList';
import AddTripRestaurantForm from '../components/AddTripRestaurantForm';
import TripActivityList from '../components/TripActivityList';
import AddTripActivityForm from '../components/AddTripActivityForm';

const ETripAdminPage = () => {
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isAddTripOpen, setAddTripOpen] = useState(false);
    const [isEditTripOpen, setEditTripOpen] = useState(false); 
    const [currentTrip, setCurrentTrip] = useState(null); // 当前选中的 Trip
    const navigate = useNavigate();

    // 打开和关闭搜索trip弹窗
    const handleOpenSearch = () => setSearchOpen(true);
    const handleCloseSearch = () => setSearchOpen(false);
    // 打开和关闭添加trip弹窗
    const handleOpenAddTrip = () => setAddTripOpen(true);
    const handleCloseAddTrip = () => setAddTripOpen(false);
    // 打开和关闭更改trip弹窗
    const handleOpenEditTrip = () => setEditTripOpen(true);
    const handleCloseEditTrip = () => setEditTripOpen(false);

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


    // 设置当前 Trip
    const handleSelectTrip = (trip) => {
        fetchCurrentTrip(trip);
        handleCloseSearch(); // 关闭弹窗
    };
    const handleTripAdded = (trip) => {
        fetchCurrentTrip(trip);
        handleCloseAddTrip();
    };
    const handleTripUpdated = (updatedTrip) => {
        fetchCurrentTrip(updatedTrip.tripid); // 更新当前 Trip
        handleCloseEditTrip();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date); // en-CA 默认 yyyy-mm-dd 格式
    };

    return (
        <Box>
            <ENavBar />
            <Box display="flex" sx={{ height: '100vh', marginTop: '85px' }}>
                {/* 左侧侧边栏 */}
                <Box
                    position="fixed"
                    sx={{
                        width: '300px',
                        backgroundColor: '#f4f4f4',
                        padding: '16px',
                        borderRight: '1px solid #ddd',
                        height: '100vh'
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Trip Management
                    </Typography>
                    <Button variant="contained" color="primary" fullWidth onClick={handleOpenSearch}>
                        Search Trip
                    </Button>
                    <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 2 }} onClick={handleOpenAddTrip}>
                        Add Trip
                    </Button>
                    <AddTripDialog open={isAddTripOpen} onClose={handleCloseAddTrip} onTripAdded={handleTripAdded} />
            

                    <Box mt={4}>
                        <Typography variant="subtitle1" gutterBottom>
                            Current Trip:
                        </Typography>
                        {currentTrip ? (
                            <Box>
                                <Typography variant="body1">
                                    ID: {currentTrip.tripid}
                                </Typography>                           
                                <Typography variant="body1">
                                    {currentTrip.startPort} → {currentTrip.endPort}
                                </Typography>
                                <Typography variant="body2" mt={1}>
                                    Start Date:
                                    <br />
                                    {formatDate(currentTrip.startDate)}
                                </Typography>
                                <Typography variant="body2" mt={1}>
                                    End Date:
                                    <br />
                                    {formatDate(currentTrip.endDate)}
                                </Typography>
                                <Typography variant="body2" mt={1}>
                                    Night:
                                    <br />
                                    {currentTrip.night}
                                </Typography>
                                <Typography variant="body2" mt={1}>
                                    Active: {currentTrip.isActive === 'Y' ? 'Yes' : 'No'}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={handleOpenEditTrip}
                                >
                                    Edit Trip
                                </Button>
                                <EditTripDialog
                                    open={isEditTripOpen}
                                    onClose={handleCloseEditTrip}
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

                </Box>

                {/* 右侧操作界面 */}
                <Box flex="1" padding="16px" sx={{ marginLeft: '330px',}} >
                    {/* 功能区域（占位符） */}
                    <Box>
                        <AddTripPackageForm
                            tripID={currentTrip?.tripid}
                            onPackageAdded={() => tripPackageListRef.current?.fetchTripPackages()} // 调用子组件方法
                        />
                        <TripPackageList
                            ref={tripPackageListRef} // 绑定引用
                            tripID={currentTrip?.tripid}
                        />
                    </Box>
                    <Box>
                        <AddTripRestaurantForm tripID={currentTrip?.tripid} onRestaurantAdded={() => tripRestaurantListRef.current?.fetchTripRestaurants()} />
                        <TripRestaurantList  ref={tripRestaurantListRef}  tripID={currentTrip?.tripid} onRestaurantRemoved ={() => fetchCurrentTrip(currentTrip?.tripid)} />
                    </Box>
                    <Box>
                    <AddTripActivityForm
        tripID={currentTrip?.tripid}
        onActivityAdded={() => tripActivityListRef.current?.fetchTripActivities()} // 调用子组件方法
      />
      <TripActivityList
        ref={tripActivityListRef} // 绑定引用
        tripID={currentTrip?.tripid}
      />
                    </Box>
                </Box>
            </Box>

            {/* 搜索弹窗 */}
            <Dialog open={isSearchOpen} onClose={handleCloseSearch} fullWidth maxWidth="md">
                <DialogTitle>Search Trip</DialogTitle>
                <DialogContent>
                    <SearchTripForm onSelectTrip={handleSelectTrip} />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ETripAdminPage;
