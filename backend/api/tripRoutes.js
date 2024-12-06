const express = require('express');
const router = express.Router();
const db = require('../util/db');

router.post('/find', async (req, res) => {
    const { startPort, endPort, startDate, endDate, night } = req.body;

    try {
        const params = [];
        let portConditions = '';

        // 查询港口ID
        if (startPort) {
            portConditions += `
                SELECT portid FROM DPX_PORT WHERE pname LIKE ? LIMIT 1
            `;
            params.push(`%${startPort}%`);
        }
        if (endPort) {
            portConditions += `
                SELECT portid FROM DPX_PORT WHERE pname LIKE ? LIMIT 1
            `;
            params.push(`%${endPort}%`);
        }

        // 构建主查询
        let query = `
            SELECT 
                T.*,
                SP.pname AS start_port_name,
                EP.pname AS end_port_name,
                (
                    SELECT GROUP_CONCAT(P.pname ORDER BY TP.sequence_number SEPARATOR ', ')
                    FROM DPX_TRIP_PORT TP
                    INNER JOIN DPX_PORT P ON TP.portid = P.portid
                    WHERE TP.tripid = T.tripid
                ) AS ports
            FROM DPX_TRIP T
            LEFT JOIN DPX_PORT SP ON T.start_port = SP.portid
            LEFT JOIN DPX_PORT EP ON T.end_port = EP.portid
            WHERE T.is_active = 'Y'
        `;

        // 添加条件
        if (startPort) {
            query += ` AND T.start_port = (${portConditions})`;
        }
        if (endPort) {
            query += ` AND T.end_port = (${portConditions})`;
        }
        if (startDate) {
            query += ` AND T.startdate >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND T.enddate <= ?`;
            params.push(endDate);
        }
        if (night) {
            query += ` AND T.night = ?`;
            params.push(night);
        }

        // 查询数据库
        const [results] = await db.execute(query, params);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch trips' });
    }
});

// 获取特定 Trip 信息
router.get('/findid', async (req, res) => {
    const { tripid } = req.query;

    if (!tripid) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    try {
        // 查询 Trip 信息，包括端口名称和途径港口信息
        const [trip] = await db.execute(`
            SELECT 
                T.startdate AS startDate,
                T.enddate AS endDate,
                T.night,
                SP.pname AS startPort,
                EP.pname AS endPort,
                (
                    SELECT GROUP_CONCAT(P.pname ORDER BY TP.sequence_number SEPARATOR ', ')
                    FROM DPX_TRIP_PORT TP
                    INNER JOIN DPX_PORT P ON TP.portid = P.portid
                    WHERE TP.tripid = T.tripid
                ) AS ports
            FROM DPX_TRIP T
            LEFT JOIN DPX_PORT SP ON T.start_port = SP.portid
            LEFT JOIN DPX_PORT EP ON T.end_port = EP.portid
            WHERE T.is_active = 'Y' AND T.tripid = ?
        `, [tripid]);

        if (!trip.length) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // 返回 Trip 数据
        res.status(200).json(trip[0]);
    } catch (err) {
        console.error('Failed to fetch trip details:', err);
        res.status(500).json({ message: 'Failed to fetch trip details' });
    }
});


module.exports = router;
