import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    MenuItem,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import axios from 'axios';
import SignupB from '../assets/signupB.jpg';
import Header from '../components/LogoHeader';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'customer',
        otpCode: '',
    });
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0); // 倒计时状态

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 倒计时逻辑
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

    // 发送验证码逻辑
    const sendVerificationCode = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post('https://localhost:3001/api/verification/send-code', {
                email: formData.email,
                code_type: 'R',
            });
            setSuccess('Verification code sent to your email.');
            setEmailSent(true);
            setTimer(30); // 开启30秒倒计时
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Email is already in use.');
            } else {
                setError(err.response?.data?.message || 'Failed to send verification code.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 提交注册逻辑
    const handleSignup = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post('https://localhost:3001/api/auth/register', formData);
            setSuccess('Registration successful! Please login.');
            setEmailSent(false); // 重置状态
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundImage: `url(${SignupB})`,
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
                            Sign Up
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
                            label="Username"
                            fullWidth
                            margin="normal"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            variant="outlined"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            variant="outlined"
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            margin="normal"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={emailSent} // 邮箱已验证后禁用输入
                            variant="outlined"
                        />
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            margin="normal"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="employee">Employee</MenuItem>
                        </TextField>

                        {emailSent && (
                            <TextField
                                label="Verification Code"
                                fullWidth
                                margin="normal"
                                name="otpCode"
                                value={formData.otpCode}
                                onChange={handleChange}
                                variant="outlined"
                            />
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
                                    onClick={handleSignup}
                                    fullWidth
                                    disabled={loading || !formData.otpCode}
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Register'}
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

export default SignupPage;
