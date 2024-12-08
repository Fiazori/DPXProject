import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    MenuItem,
    CircularProgress,
    Autocomplete,
} from '@mui/material';
import axios from 'axios';

const AddTripDialog = ({ open, onClose, onTripAdded }) => {
    const [ports, setPorts] = useState([]);
    const [startPort, setStartPort] = useState('');
    const [endPort, setEndPort] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [night, setNight] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            // Fetch port data when the dialog opens
            fetchPorts();
        }
    }, [open]);

    const fetchPorts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/trips/ports`);
            setPorts(response.data); // Assume ports contain [{ portid, pname }]
        } catch (err) {
            console.error('Failed to fetch ports:', err);
        }
    };

    const handleAddTrip = async () => {
        setLoading(true);
        try {
            // Insert into DPX_TRIP
            const tripResponse = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/trips/add`, {
                startDate,
                endDate,
                night: parseInt(night, 10),
                startPortId: ports.find((port) => port.portid === startPort || port.pname === startPort)?.portid,
                endPortId: ports.find((port) => port.portid === endPort || port.pname === endPort)?.portid,
            });
            const tripId = tripResponse.data.tripId;

            onTripAdded(tripId);

            // Reset form and close dialog
            setStartPort('');
            setEndPort('');
            setStartDate('');
            setEndDate('');
            setNight(0);
            onClose();
        } catch (err) {
            console.error('Failed to add trip:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add Trip</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Autocomplete
                    options={ports} // 数据源：港口信息数组
                    getOptionLabel={(option) => `${option.portid} - ${option.pname}`} // 显示的标签格式
                    renderInput={(params) => <TextField {...params} label="Start Port" fullWidth />}
                    onInputChange={(event, value) => setStartPort(value)} // 输入时触发
                    onChange={(event, value) => setStartPort(value ? value.portid : '')} // 选中时触发
                />
                <Autocomplete
                    options={ports}
                    getOptionLabel={(option) => `${option.portid} - ${option.pname}`}
                    renderInput={(params) => <TextField {...params} label="End Port" fullWidth />}
                    onInputChange={(event, value) => setEndPort(value)}
                    onChange={(event, value) => setEndPort(value ? value.portid : '')}
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
                        label="Night"
                        type="number"
                        value={night}
                        onChange={(e) => setNight(e.target.value)}
                        placeholder="Enter number of nights"
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddTrip}
                        disabled={loading || !startPort || !endPort || !startDate || !endDate || night <= 0}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Add Trip'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddTripDialog;
