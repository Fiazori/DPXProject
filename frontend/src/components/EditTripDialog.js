import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';

const EditTripDialog = ({ open, onClose, currentTrip, onTripUpdated }) => {
    const [startDate, setStartDate] = useState(currentTrip?.startDate || '');
    const [endDate, setEndDate] = useState(currentTrip?.endDate || '');
    const [night, setNight] = useState(currentTrip?.night || '');
    const [isActive, setIsActive] = useState(currentTrip?.isActive === 'Y');

    const handleUpdateTrip = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trips/update`, {
                tripid: currentTrip.tripid,
                startDate,
                endDate,
                night: parseInt(night, 10),
                isActive: isActive ? 'Y' : 'N',
            });
            // Update parent state with new trip data
            const updatedTrip = {
                ...currentTrip,
                startDate,
                endDate,
                night,
                isActive: isActive ? 'Y' : 'N',
            };
            onTripUpdated(updatedTrip);
            onClose();
        } catch (err) {
            console.error('Failed to update trip:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
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
                        label="Night"
                        type="number"
                        value={night}
                        onChange={(e) => setNight(e.target.value)}
                        fullWidth
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Active"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateTrip}
                        disabled={!startDate || !endDate || !night}
                    >
                        Update Trip
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default EditTripDialog;
