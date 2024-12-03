import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../util/auth';
import NavBar from '../components/NavBar';

const SettingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login'); // 未登录跳转到登录页
        }
    }, [navigate]);

    return (
        <Box>
            <NavBar />

        </Box>
    );
};

export default SettingPage;
