import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const InvoicePage = () => {
    const [searchParams] = useSearchParams();
    const groupid = searchParams.get('groupid');
    const tripid = searchParams.get('tripid');

    const [roomDetails, setRoomDetails] = useState([]);
    const [packageDetails, setPackageDetails] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalRoomCost, setTotalRoomCost] = useState(0);
    const [totalPackageCost, setTotalPackageCost] = useState(0);
    
    // Fetch invoice details
    useEffect(() => {
        const fetchInvoiceDetails = async () => {
            const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/invoice/details`, {
                params: { groupid, tripid },
            });
        
            setRoomDetails(data.roomDetails);
            setPackageDetails(data.packageDetails);
            setTotalRoomCost(parseFloat(data.totalRoomCost).toFixed(2));
            setTotalPackageCost(parseFloat(data.totalPackageCost).toFixed(2));
        };
        

        const createOrUpdateInvoice = async () => {
            const { data } = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/invoice/create-or-update`, {
                groupid,
                tripid,
            });

            setTotalAmount(parseFloat(data.totalAmount).toFixed(2));
        };

        fetchInvoiceDetails();
        createOrUpdateInvoice();
    }, [groupid, tripid]);

    return (
        <Box sx={{ maxWidth: '1200px', margin: 'auto', marginTop: '20px' }}>
            <Typography variant="h4" textAlign="center">
                Invoice
            </Typography>
            <Typography variant="h5" textAlign="center" sx={{ marginTop: '10px' }}>
                Total Amount: ${totalAmount}
            </Typography>

            {/* Room Details */}
            <Typography sx={{ marginTop: '50px' }}>
    Total Room Cost: ${totalRoomCost}
</Typography>
            <TableContainer component={Paper} sx={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Room Number</TableCell>
                            <TableCell>Price</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roomDetails.map((room, index) => (
                            <TableRow key={index}>
                                <TableCell>{room.roomnumber}</TableCell>
                                <TableCell>${room.price}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Package Details */}
            <Typography  sx={{ marginTop: '20px' }}>
    Total Package Cost: ${totalPackageCost}
</Typography>
            <TableContainer component={Paper} sx={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Passenger</TableCell>
                            <TableCell>Package</TableCell>
                            <TableCell>Cost</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {packageDetails.map((pkg, index) => (
                            <TableRow key={index}>
                                <TableCell>{pkg.fname} {pkg.lname}</TableCell>
                                <TableCell>{pkg.packtype}</TableCell>
                                <TableCell>${pkg.packageCost}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Back Button */}
            <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => window.history.back()}
                    sx={{
                        backgroundColor: '#007bff',
                        color: '#fff',
                        padding: '12px 30px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        '&:hover': {
                            backgroundColor: '#0056b3',
                        },
                    }}
                >
                    Back
                </Button>
            </Box>
        </Box>
    );
};

export default InvoicePage;
