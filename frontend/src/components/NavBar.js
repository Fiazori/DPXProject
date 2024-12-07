import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../util/auth';
import {jwtDecode} from 'jwt-decode';
import logo from '../assets/logo.png';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const NavBar = () => {
    const navigate = useNavigate();
    const token = getToken();
    const user = token ? jwtDecode(token) : null;

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        clearToken();
        navigate('/login'); // 跳转至登录页
    };

    const handleSettings = () => {
        navigate('/setting');
    };

    // 导航项
    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Find Trip', path: '/findtrip' },
        { label: 'Manage Trip', path: '/manage-trip' },
        { label: 'dgsdgsdtgyet', path: '/4' },
        { label: 'rwrwqasr', path: '/5' },
        { label: 'wrwrwq', path: '/6' },
    ];

    return (
        <AppBar position="fixed" color="primary"
            sx={{
                backgroundColor: 'rgba(200, 200, 200, 0.5)', // 半透明
                backdropFilter: 'blur(5px)', // 添加模糊效果
                width: '100%'
            }}
        >
            <Toolbar>
                {/* 导航栏左侧 */}
                <Typography component="div" color="#00264d" sx={{ fontSize: '38px', fontFamily: "'Pacifico'", fontWeight: 'bold', marginRight: '12px' }}>
                    DPX Cruises
                </Typography>
                <Box
                    component="img"
                    src={logo}
                    alt="Logo"
                    sx={{
                        height: '84px', // Logo 高度
                        marginRight: '16px', // 与导航项的间距
                    }}
                />
                <Box display="flex" flexGrow={1} justifyContent="center" alignItems="center">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            style={({ isActive }) => ({
                                textDecoration: 'none',
                                color: isActive ? '#004080' : '#555555', // 当前页面高亮
                                marginRight: '2%',
                            })}
                        >
                            <Button color="inherit"
                                sx={{
                                    fontSize: '22px',
                                    textShadow: '0 0px 5px rgba(179, 217, 255, 1)'
                                }}>
                                {item.label}
                            </Button>
                        </NavLink>
                    ))}
                </Box>

                {/* 右侧用户信息和菜单 */}
                {user && user.username ? (
                    <Box>
                        <Typography variant="body1" component="span" sx={{ marginRight:'10px', color: 'black !important'}}>
                            Welcome, {user.username}
                        </Typography>
                        <IconButton onClick={handleMenuOpen} color="inherit" sx={{marginRight:'30px', color: 'black',}}>
                            <AccountCircleIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            disableScrollLock={true}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center', // 菜单对齐到触发按钮的右侧
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center', // 菜单的右侧对齐到按钮的右侧
                            }}
                        >
                            <MenuItem onClick={() => { handleSettings(); handleMenuClose(); }}>Setting</MenuItem>
                            <MenuItem onClick={() => { handleSignOut(); handleMenuClose(); }}>Log Out</MenuItem>
                        </Menu>

                    </Box>
                ) : (
                    <Box>
                        <Typography variant="body1" component="span" sx={{ marginRight: 2 }}>
                            Welcome, Guest
                        </Typography>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
