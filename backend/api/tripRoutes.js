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


//管理员接口
router.get('/admin/findid', async (req, res) => {
    const { tripid } = req.query;

    if (!tripid) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    try {
        // 查询 Trip 信息，包括港口和途径港口
        const [trip] = await db.execute(`
            SELECT 
                T.tripid,
                T.startdate AS startDate,
                T.enddate AS endDate,
                T.night,
                T.is_active AS isActive,
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
            WHERE T.tripid = ?
        `, [tripid]);

        if (!trip.length) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.status(200).json(trip[0]);
    } catch (err) {
        console.error('Failed to fetch trip details:', err);
        res.status(500).json({ message: 'Failed to fetch trip details' });
    }
});

router.post('/admin/find', async (req, res) => {
    const { TripID, startPort, endPort, startDate, endDate, night } = req.body;

    try {
        const params = [];
        let query = `
            SELECT 
                T.tripid,
                T.startdate AS startDate,
                T.enddate AS endDate,
                T.night,
                T.is_active AS isActive,
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
            WHERE 1=1
        `;

        // 添加条件
        if (TripID) {
            query += ` AND T.tripid = ?`;
            params.push(parseInt(TripID, 10));
        }
        if (startPort) {
            query += ` AND SP.pname LIKE ?`;
            params.push(`%${startPort}%`);
        }
        if (endPort) {
            query += ` AND EP.pname LIKE ?`;
            params.push(`%${endPort}%`);
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
            params.push(parseInt(night, 10));
        }

        const [results] = await db.execute(query, params);
        res.json(results);
    } catch (err) {
        console.error('Failed to fetch trips:', err);
        res.status(500).json({ message: 'Failed to fetch trips' });
    }
});

router.get('/ports', async (req, res) => {
    try {
        const [ports] = await db.execute(`
            SELECT portid, pname 
            FROM DPX_PORT
        `);
        res.status(200).json(ports);
    } catch (err) {
        console.error('Failed to fetch ports:', err);
        res.status(500).json({ message: 'Failed to fetch ports' });
    }
});

router.post('/add', async (req, res) => {
    const { startPortId, endPortId, startDate, endDate, night } = req.body;

    if (!startPortId || !endPortId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    try {
        // 插入 DPX_TRIP
        const [result] = await db.execute(`
            INSERT INTO DPX_TRIP (start_port, end_port, startdate, enddate, night, is_active)
            VALUES (?, ?, ?, ?, ?, 'N')
        `, [startPortId, endPortId, startDate, endDate, night]);

        const tripId = result.insertId;

        // 插入起点港口到 DPX_TRIP_PORT
        await db.execute(`
            INSERT INTO DPX_TRIP_PORT (tripid, portid, sequence_number, arrivaltime, departuretime)
            VALUES (?, ?, 1, ?, ?)
        `, [tripId, startPortId, startDate, startDate]);

        // 插入终点港口到 DPX_TRIP_PORT
        await db.execute(`
            INSERT INTO DPX_TRIP_PORT (tripid, portid, sequence_number, arrivaltime, departuretime)
            VALUES (?, ?, 2, ?, ?)
        `, [tripId, endPortId, endDate, endDate]);
        res.status(201).json({ message: 'Trip added successfully', tripId, });
    } catch (err) {
        console.error('Failed to add trip:', err);
        res.status(500).json({ message: 'Failed to add trip' });
    }
});

router.post('/update', async (req, res) => {
    const { tripid, startDate, endDate, night, isActive } = req.body;

    // 参数验证
    if (!tripid || !startDate || !endDate || !night || !isActive) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // 更新 Trip 数据
        const updateQuery = `
            UPDATE DPX_TRIP
            SET startdate = ?, 
                enddate = ?, 
                night = ?, 
                is_active = ?
            WHERE tripid = ?
        `;

        const [result] = await db.execute(updateQuery, [
            startDate,
            endDate,
            parseInt(night, 10),
            isActive,
            tripid,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Trip not found or no changes made' });
        }

        return res.status(200).json({ message: 'Trip updated successfully' });
    } catch (err) {
        console.error('Error updating trip:', err);
        return res.status(500).json({ message: 'Failed to update trip' });
    }
});

module.exports = router;
