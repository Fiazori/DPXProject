import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { getToken, clearToken } from '../util/auth';
import NavBar from '../components/NavBar';
import axios from 'axios';

const SettingPage = () => {
    const navigate = useNavigate();
    const token = getToken();
    const user = token ? jwtDecode(token) : null;

    const [newUsername, setNewUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deleteAccountOtp, setDeleteAccountOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // 错误信息
    const [successMessage, setSuccessMessage] = useState(''); // 成功信息

    // 如果用户未登录，则跳转到登录页面
    useEffect(() => {
        if (!token || !user) {
            navigate('/login'); // 未登录跳转到登录页
        }
    }, [token, user, navigate]);

    // 重置错误和成功信息
    const resetMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    // 修改用户名
    const handleChangeUsername = async () => {
        resetMessages(); // 重置消息
        if (!newUsername) return setError('Please enter a new username');
        setLoading(true);
        try {
            // 调用修改用户名接口
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/auth/change-username`,
                {
                    email: user.user_email, // 从 token 解码的用户信息中获取 email
                    username: newUsername,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            // 获取新的 token
            const newToken = response.data.token;
            if (newToken) {
                localStorage.setItem('token', newToken); // 更新本地存储的 token
                setSuccessMessage('Username updated successfully.');
            } else {
                setSuccessMessage('Username updated successfully, but token was not provided.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update username');
        }
        setLoading(false);
    };

    // 修改密码
    const handleChangePassword = async () => {
        resetMessages();
        if (!oldPassword || !newPassword) return setError('Please provide old and new passwords');
        setLoading(true);
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/auth/change-password`, {
                oldPassword,
                newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccessMessage('Password updated successfully');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update password');
        }
        setLoading(false);
    };

    // 发送验证码
    const handleSendCode = async () => {
        resetMessages();
        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/verification/send-code`, {
                email: user.user_email,
                code_type: 'D',
            });
            setSuccessMessage('Verification code sent to your email');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to send verification code');
        }
        setLoading(false);
    };

    // 删除账户
    const handleDeleteAccount = async () => {
        resetMessages();
        if (!deleteAccountOtp) return setError('Please enter the OTP code');
        setLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/auth/delete-account`, {
                data: { email: user.user_email, otpCode: deleteAccountOtp },
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccessMessage('Account deleted successfully');
            clearToken();
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to delete account');
        }
        setLoading(false);
    };

    return (
        <Box>
            <NavBar />
            <Box sx={{ maxWidth: '600px', marginTop: '130px', marginLeft: 'auto', marginRight: 'auto' }}>
                <Typography variant="h4" mb={2}>Settings</Typography>

                {/* 显示错误或成功信息 */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                {/* 修改用户名 */}
                <Box mb={4}>
                    <Typography variant="h6">Change Username</Typography>
                    <TextField
                        label="New Username"
                        fullWidth
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleChangeUsername}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        Change Username
                    </Button>
                </Box>

                {/* 修改密码 */}
                <Box mb={4}>
                    <Typography variant="h6">Change Password</Typography>
                    <TextField
                        label="Old Password"
                        fullWidth
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="New Password"
                        fullWidth
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        Change Password
                    </Button>
                </Box>

                {/* 删除账户 */}
                <Box mb={4}>
                    <Typography variant="h6">Delete Account</Typography>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                        Enter your email verification code to delete your account.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Email OTP"
                            fullWidth
                            value={deleteAccountOtp}
                            onChange={(e) => setDeleteAccountOtp(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSendCode}
                            disabled={loading}
                        >
                            Send Code
                        </Button>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        sx={{ mt: 2 }}
                        color="error"
                    >
                        Delete Account
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default SettingPage;
