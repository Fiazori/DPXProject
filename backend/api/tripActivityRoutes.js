const express = require('express');
const router = express.Router();
const pool = require('../util/db');

// 获取所有可选活动和其楼层
router.get('/list', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.actid, a.actname, a.unit, a.min_age_limit, a.max_age_limit, af.floor
             FROM dpx_activity a
             LEFT JOIN dpx_activity_floor af ON a.actid = af.actid`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching activities');
    }
});

// 获取当前 trip 的活动
router.get('/tripActivities', async (req, res) => {
    const { tripID } = req.query;

    if (!tripID) return res.status(400).send('Missing tripID parameter');

    try {
        const [rows] = await pool.query(
            `SELECT a.actid, a.actname, a.unit, a.min_age_limit, a.max_age_limit, af.floor
             FROM dpx_trip_activity ta
             JOIN dpx_activity a ON ta.actid = a.actid
             LEFT JOIN dpx_activity_floor af ON a.actid = af.actid
             WHERE ta.tripid = ?`,
            [tripID]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching trip activities');
    }
});

// 向 trip 添加活动
router.post('/add', async (req, res) => {
    const { tripID, actID } = req.body;

    if (!tripID || !actID) return res.status(400).send('Missing tripID or actID');

    try {
        // 检查是否已存在
        const [existing] = await pool.query(
            'SELECT * FROM dpx_trip_activity WHERE tripid = ? AND actid = ?',
            [tripID, actID]
        );

        if (existing.length > 0) {
            return res.status(400).send('Activity already exists for this trip');
        }

        // 插入关联
        await pool.query(
            'INSERT INTO dpx_trip_activity (tripid, actid) VALUES (?, ?)',
            [tripID, actID]
        );
        res.send('Activity added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding activity to trip');
    }
});

module.exports = router;
