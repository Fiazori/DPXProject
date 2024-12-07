import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';

const InvoicePage = () => {
    const [searchParams] = useSearchParams();
    const groupid = searchParams.get('groupid');
    const tripid = searchParams.get('tripid');

    const [roomDetails, setRoomDetails] = useState([]);
    const [packageDetails, setPackageDetails] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalRoomCost, setTotalRoomCost] = useState(0);
    const [totalPackageCost, setTotalPackageCost] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [dueDate, setDueDate] = useState('');
    const [remainingAmount, setRemainingAmount] = useState(0);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' 或 'error'
    
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('Credit Card');
    const [invoiceId, setInvoiceId] = useState(null);

    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    useEffect(() => {
        const initializeInvoice = async () => {
            try {
                // 先创建或更新发票
                const { data } = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/invoice/create-or-update`, {
                    groupid,
                    tripid,
                });
    
                setInvoiceId(data.inid); // 设置发票 ID
                setTotalAmount(parseFloat(data.totalAmount).toFixed(2)); // 设置总金额
    
                // 获取发票详情
                await fetchInvoiceDetails();
            } catch (err) {
                console.error('Failed to initialize invoice:', err);
            }
        };
    
        initializeInvoice();
    }, [groupid, tripid]);
    
    // 获取发票详情
    const fetchInvoiceDetails = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/invoice/details`, {
                params: { groupid, tripid },
            });
    
            const sortedPackageDetails = data.packageDetails.sort((a, b) =>
                a.fname.localeCompare(b.fname)
            );
    
            setRoomDetails(data.roomDetails);
            setPackageDetails(sortedPackageDetails);
            setTotalRoomCost(parseFloat(data.totalRoomCost).toFixed(2));
            setTotalPackageCost(parseFloat(data.totalPackageCost).toFixed(2));
            setTotalAmount(parseFloat(data.totalAmount).toFixed(2));
            setTotalPaid(parseFloat(data.totalPaid).toFixed(2));
            setRemainingAmount(parseFloat(data.totalAmount - data.totalPaid).toFixed(2));
            setDueDate(data.dueDate);
        } catch (err) {
            console.error('Failed to fetch invoice details:', err);
        }
    };
    
    // 获取付款历史
    const fetchPaymentHistory = async () => {
        if (!invoiceId) return;
    
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/invoice/payment-history`, {
                params: { inid: invoiceId },
            });
    
            setPaymentHistory(data);
        } catch (err) {
            console.error('Failed to fetch payment history:', err);
        }
    };
    
    useEffect(() => {
        if (invoiceId) {
            fetchPaymentHistory();
        }
    }, [invoiceId]);
    
    // 处理付款
    const handlePayment = async () => {
        if (!payAmount || parseFloat(payAmount) <= 0) {
            setPaymentMessage('Please enter a valid payment amount.');
            setMessageType('error');
            return;
        }
    
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/invoice/payment`, {
                inid: invoiceId,
                payamount: parseFloat(payAmount),
                paymethod: payMethod,
            });
    
            setPaymentMessage('Payment recorded successfully!');
            setMessageType('success');
            setPayAmount('');
    
            // 更新付款历史和发票详情
            fetchPaymentHistory();
            fetchInvoiceDetails();
        } catch (err) {
            setPaymentMessage(err.response?.data?.message || 'Failed to record payment.');
            setMessageType('error');
        }
    };
    

    return (
        <Box>
        <NavBar />
        <Sidebar />
        <Box sx={{ maxWidth: '1200px', margin: 'auto', marginTop: '120px' }}>
            <Typography variant="h4" textAlign="center">
                Invoice
            </Typography>
            <Box sx={{ marginTop: '10px', textAlign: 'center' }}>
    <Typography variant="h6" sx={{ display: 'inline', marginRight: '20px' }}>
        Total Amount: ${totalAmount}
    </Typography>
    <Typography variant="h6" sx={{ display: 'inline' }}>
        Due Date: {new Date(dueDate).toLocaleDateString()}
    </Typography>
</Box>

<Box sx={{ marginTop: '10px', textAlign: 'center' }}>
    <Typography variant="h6" sx={{ display: 'inline', marginRight: '20px' }}>
        Paid: ${totalPaid}
    </Typography>
    <Typography variant="h6" sx={{ display: 'inline' }}>
        Remaining: ${remainingAmount}
    </Typography>
</Box>


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
            <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
    <Button
        variant="contained"
        color="primary"
        sx={{ marginRight: '10px' }}
        onClick={() => setOpenPaymentDialog(true)}
    >
        Pay
    </Button>
    <Button
        variant="outlined"
        color="secondary"
        onClick={() => setOpenHistoryDialog(true)}
    >
        Payment History
    </Button>
</Box>


            {/* Payment Section */}
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
    <DialogTitle>Make a Payment</DialogTitle>
    <DialogContent>
        <TextField
            label="Payment Amount"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            fullWidth
            sx={{ marginBottom: '20px' }}
        />
        <Select
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            fullWidth
            sx={{ marginBottom: '20px' }}
        >
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
        </Select>
    </DialogContent>
    {paymentMessage && (
    <Box
        sx={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            borderRadius: '4px',
            textAlign: 'center',
        }}
    >
        {paymentMessage}
    </Box>
)}

    <DialogActions>
        <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handlePayment}>
            Pay
        </Button>
    </DialogActions>
</Dialog>

            {/* Payment History */}
            <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
    <DialogTitle>Payment History</DialogTitle>
    <DialogContent>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Type</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paymentHistory.map((payment, index) => (
                        <TableRow key={index}>
                            <TableCell>{payment.paydate}</TableCell>
                            <TableCell>${parseFloat(payment.payamount).toFixed(2)}</TableCell>
                            <TableCell>{payment.paymethod}</TableCell>
                            <TableCell>{payment.paytype}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
    </DialogActions>
</Dialog>

        </Box>
        </Box>
    );
};

export default InvoicePage;
