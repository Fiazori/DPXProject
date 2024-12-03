import React from 'react';
import { Typography, Box } from '@mui/material';
import logo from '../assets/logo.png';

const Header = () => {
    return (
        <Box
            sx={{
                position: 'absolute', // 绝对定位到页面左上角
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center', // 垂直对齐
                padding: '16px', // 添加一些内边距
                backgroundColor: '#', // 背景色，可选
                zIndex: 1000, // 确保在最上层
            }}
        >
            <Typography
                component="div"
                color="#00264d"
                sx={{fontSize:'38px', fontFamily: "'Pacifico'", fontWeight: 'bold', marginRight: '12px'}}
            >
                DPX Cruises
            </Typography>
            <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                    height: '84px', // Logo 高度
                    marginRight: '16px',
                }}
            />
        </Box>
    );
};

export default Header;
