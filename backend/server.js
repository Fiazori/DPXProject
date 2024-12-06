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
const app = express();

app.use(cors());
app.use(bodyParser.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/passenger', passengerRoutes);

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
