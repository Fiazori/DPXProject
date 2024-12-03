import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import axios from 'axios';
import ResetB from '../assets/resetB.jpg'; // Replace with your background image
import Header from '../components/LogoHeader';

const ResetPasswordPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        otpCode: '',
        newPassword: '',
    });
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0); // Countdown state for resending OTP

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Countdown logic
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && interval) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Send OTP logic
    const sendVerificationCode = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:3001/api/verification/send-code', {
                email: formData.email,
                code_type: 'C',
            });
            setSuccess('Verification code sent to your email.');
            setEmailSent(true);
            setTimer(30); // Start 30 seconds countdown
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    // Reset Password logic
    const handleResetPassword = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:3001/api/auth/reset-password', {
                email: formData.email,
                otpCode: formData.otpCode,
                newPassword: formData.newPassword,
            });
            setSuccess('Password reset successfully! Please log in with your new password.');
            setEmailSent(false); // Reset state
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundImage: `url(${ResetB})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Header />
            <Container maxWidth="xs">
                <Card sx={{ boxShadow: 3, borderRadius: 4, overflow: 'hidden' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            align="center"
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                color: 'primary.main',
                                textTransform: 'uppercase',
                            }}
                        >
                            Reset Password
                        </Typography>
                        {error && (
                            <Typography
                                color="error"
                                align="center"
                                sx={{
                                    mb: 2,
                                    fontWeight: 'bold',
                                }}
                            >
                                {error}
                            </Typography>
                        )}
                        {success && (
                            <Typography
                                color="primary"
                                align="center"
                                sx={{
                                    mb: 2,
                                    fontWeight: 'bold',
                                }}
                            >
                                {success}
                            </Typography>
                        )}

                        <TextField
                            label="Email"
                            fullWidth
                            margin="normal"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={emailSent} // Disable input after email is sent
                            variant="outlined"
                        />
                        {emailSent && (
                            <>
                                <TextField
                                    label="Verification Code"
                                    fullWidth
                                    margin="normal"
                                    name="otpCode"
                                    value={formData.otpCode}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                                <TextField
                                    label="New Password"
                                    type="password"
                                    fullWidth
                                    margin="normal"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </>
                        )}

                        {!emailSent ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={sendVerificationCode}
                                fullWidth
                                disabled={loading || !formData.email || timer > 0}
                                sx={{
                                    mt: 2,
                                    p: 1.5,
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                }}
                            >
                                {loading ? <CircularProgress size={24} /> : timer > 0 ? `Wait ${timer}s` : 'Send Verification Code'}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleResetPassword}
                                    fullWidth
                                    disabled={loading || !formData.otpCode || !formData.newPassword}
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                                </Button>
                                <Button
                                    variant="text"
                                    color="secondary"
                                    onClick={sendVerificationCode}
                                    fullWidth
                                    disabled={timer > 0 || loading}
                                    sx={{
                                        mt: 1,
                                        p: 1.5,
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                    }}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                </Button>
                            </>
                        )}

                        <Box mt={3}>
                            <Typography align="center" variant="body2">
                                Already have an account?{' '}
                                <a href="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                                    Log in
                                </a>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default ResetPasswordPage;
