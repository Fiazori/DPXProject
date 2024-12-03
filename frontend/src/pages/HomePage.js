import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../util/auth';
import NavBar from '../components/NavBar';
import promoVideo from '../assets/promo.mp4';

const HomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login'); // 未登录跳转到登录页
        }
    }, [navigate]);

    return (
        <Box>
            {/* 导航栏 */}
            <NavBar />

            {/* 视频背景 */}
            <Box
                sx={{
                    position: 'absolute', // 相对父级布局
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1, // 放置到背景层
                    overflow: 'hidden',
                }}
            >
                <video
                    autoPlay
                    loop
                    muted
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                >
                    <source src={promoVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </Box>

            {/* 页面内容 */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
                sx={{
                    position: 'relative', // 内容位于视频之上
                    zIndex: 1,
                }}
            >
                <Typography variant="h2" sx={{ color: 'white', textShadow: '0 4px 4px rgba(0, 0, 0, 0.8)', fontWeight:"bold"}}>
                Your Journey Begins Here
                </Typography>
            </Box>

            {/* 示例其他内容 */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Typography variant="h4" sx={{ color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                    Scroll down for more
                </Typography>
            </Box>
        </Box>
    );
};

export default HomePage;




// import React from 'react';
// import { Link } from 'react-router-dom';

// const Home = () => {
//     return (
//         <div style={{ textAlign: 'center', padding: '50px' }}>
//             <h1>Welcome to DPX Cruise</h1>
//             <p>Discover amazing trips and activities on our cruise platform.</p>
            
//             <div style={{ marginTop: '30px' }}>
//                 <Link to="/login" style={{ margin: '10px', textDecoration: 'none' }}>
//                     <button style={{ padding: '10px 20px', fontSize: '16px' }}>Login</button>
//                 </Link>
//                 <Link to="/register" style={{ margin: '10px', textDecoration: 'none' }}>
//                     <button style={{ padding: '10px 20px', fontSize: '16px' }}>Register</button>
//                 </Link>
//             </div>

//             <div style={{ marginTop: '50px', color: '#999' }}>
//                 <p>More exciting features coming soon...</p>
//             </div>
//         </div>
//     );
// };

// export default Home;
