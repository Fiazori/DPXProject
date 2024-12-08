import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ENavBar from '../components/ENavBar';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { isELoggedIn } from '../util/auth';

const EHomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isELoggedIn()) {
            navigate('/login'); // 未登录跳转到登录页
        }
    }, [navigate]);

    const cards = [
        { label: 'Trip', path: '/ETrip', color: '#fff8e1' }, // 更浅的橙色
        { label: 'User', path: '/EUser', color: '#e3f2fd' }, // 更浅的蓝色
        { label: 'Vizualize', path: '/EVizualize', color: '#e8f5e9' }, // 更浅的绿色
    ];

    return (
        <Box>
            {/* 导航栏 */}
            <ENavBar />
            
            <Box
                display="flex"
                justifyContent="space-evenly" // 横向平均铺开
                alignItems="center"
                flexWrap="wrap"
                height="80vh"
                gap={4}
                sx={{ padding: 4 }}
            >
                {cards.map((card) => (
                    <Card
                        key={card.label}
                        sx={{
                            width: '23%', // 每个卡片宽度为页面宽度的25%
                            minWidth: 280, // 设置最小宽度以避免卡片过窄
                            height: '35%', // 增大卡片高度
                            backgroundColor: card.color,
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // 更浅的阴影
                        }}
                    >
                        <CardActionArea
                            onClick={() => navigate(card.path)}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="h3" // 增大字体
                                    sx={{

                                        color: '#00264d',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                    }}
                                >
                                    {card.label}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default EHomePage;
