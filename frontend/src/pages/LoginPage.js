import React, { useState, useEffect  } from 'react';
import { TextField, Button, Container, Typography, Box, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../util/auth';
import LoginB from '../assets/loginB.jpg';
import Header from '../components/LogoHeader';
import { isLoggedIn, isELoggedIn } from '../util/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // 检查用户是否已经登录，并导航到相应的页面
        if (isLoggedIn()) {
            navigate('/');
        } else if (isELoggedIn()) {
            navigate('/employee');
        }
    }, [navigate]);

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
                email,
                password,
            });
            setToken(response.data.token); // 保存 Token
            navigate('/'); // 跳转到主页
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Email or password');
        }
    };

    // 回车自动触发登录
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundImage: `url(${LoginB})`, // 背景图片路径
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onKeyDown={handleKeyDown} // 添加键盘监听事件
            tabIndex={0} 
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
                            Log in
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
                        <TextField
                            label="Email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                        />
                        <Typography align="left" variant="body2">
                            {' '}
                            <a href="/resetpassword" style={{ textDecoration: 'none', color: '#1976d2' }}>
                                Forget password?
                            </a>
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLogin}
                            fullWidth
                            sx={{
                                mt: 2,
                                p: 1.5,
                                fontWeight: 'bold',
                                fontSize: '16px',
                            }}
                        >
                            Login
                        </Button>
                        <Box mt={3}>
                            <Typography align="center" variant="body2">
                                Don't have an account?{' '}
                                <a href="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
                                    Sign up
                                </a>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default LoginPage;
