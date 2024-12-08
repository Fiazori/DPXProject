const express = require('express');
const router = express.Router();
const pool = require('../util/db');

// 获取所有可选 restaurants
router.get('/list', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT resid, resname, restype, resstarttime, resendtime, resfloor FROM dpx_restaurant'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching restaurants');
    }
});

// 获取当前 trip 的 restaurants
router.get('/tripRestaurants', async (req, res) => {
    const { tripID } = req.query;

    if (!tripID) return res.status(400).send('Missing tripID parameter');

    try {
        const [rows] = await pool.query(
            `SELECT r.resid, r.resname, r.restype, r.resstarttime, r.resendtime, r.resfloor
             FROM dpx_trip_restaurant t
             JOIN dpx_restaurant r ON t.resid = r.resid
             WHERE t.tripid = ?`,
            [tripID]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching trip restaurants');
    }
});

// 向 trip 添加 restaurant
router.post('/add', async (req, res) => {
    const { tripID, resid } = req.body;

    if (!tripID || !resid) return res.status(400).send('Missing tripID or resid');

    try {
        // 检查是否已存在
        const [existing] = await pool.query(
            'SELECT * FROM dpx_trip_restaurant WHERE tripid = ? AND resid = ?',
            [tripID, resid]
        );

        if (existing.length > 0) {
            return res.status(400).send('Restaurant already exists for this trip');
        }

        // 插入关联
        await pool.query(
            'INSERT INTO dpx_trip_restaurant (tripid, resid) VALUES (?, ?)',
            [tripID, resid]
        );
        res.send('Restaurant added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding restaurant to trip');
    }
});

module.exports = router;
