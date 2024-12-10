import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 从当前页面 URL 获取 groupid 和 tripid
    const searchParams = new URLSearchParams(location.search);
    const groupid = searchParams.get('groupid');
    const tripid = searchParams.get('tripid');

    // 配置选项
    const menuItems = [
        { label: 'Room', path: '/select-room' },
        { label: 'Package', path: '/add-package' },
        { label: 'Invoice', path: '/invoice' },
    ];

    return (
        <Box
            sx={{
                width: '220px',
                backgroundColor: 'rgba(217, 217, 217, 0.5)',
                boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
                padding: '20px 10px', // 添加顶部、底部和左右的间距
                position: 'fixed', // 固定在左侧
                top: '120px', // 悬浮距离顶部 20px
                left: '20px', // 悬浮距离左侧 20px
                borderRadius: '8px', // 让侧边栏有圆角
            }}
        >
            <List>
                {menuItems.map((item, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton
                            onClick={() => navigate(item.path + `?groupid=${groupid}&tripid=${tripid}`)}
                            sx={{
                                marginBottom: '10px',
                                borderRadius: '4px',
                                backgroundColor: location.pathname.includes(item.path) ? '#e0e0e0' : 'inherit',
                                '&:hover': {
                                    backgroundColor: '#d6d6d6',
                                },
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                sx={{
                                    color: location.pathname.includes(item.path) ? '#007bff' : 'inherit',
                                    fontWeight: location.pathname.includes(item.path) ? 'bold' : 'normal',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;
