const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./api/authRoutes');
const verificationRoutes = require('./api/verificationRoutes');
const tripRoutes = require('./api/tripRoutes');
const passengerRoutes = require('./api/passengerRoute');
const groupRoutes = require('./api/groupRoutes');
const roomRoutes = require('./api/roomRoutes');
const packageRoutes = require('./api/packageRoutes');
const invoiceRoutes = require('./api/invoiceRoutes')
const tripPackageRoutes = require('./api/tripPackageRoutes')
const tripRestaurantRoutes = require('./api/tripRestaurantRoutes')
const tripActivityRoutes = require('./api/tripActivityRoutes')

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/trip-package', tripPackageRoutes);
app.use('/api/trip-restaurant', tripRestaurantRoutes);
app.use('/api/trip-activity', tripActivityRoutes);

// 加载证书
const httpsOptions = {
    key: fs.readFileSync('./cert/server.key'),
    cert: fs.readFileSync('./cert/server.crt'),
};

// 启动 HTTPS 服务
const PORT = 3001;
http.createServer(app).listen(PORT, () => {
    console.log(`Secure server running on https://localhost:${PORT}`);
});
