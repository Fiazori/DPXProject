const express = require('express');
const router = express.Router();
const pool = require('../util/db');

// 获取所有可选 packages
router.get('/list', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT packID, packTYPE, packCOST, PRICING_TYPE, IS_AVAILABLE FROM DPX_PACKAGE WHERE IS_AVAILABLE = "Y"'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching packages');
    }
});

// 获取当前 trip 的 packages
router.get('/tripPackages', async (req, res) => {
    const { tripID } = req.query;

    if (!tripID) return res.status(400).send('Missing tripID parameter');

    try {
        const [rows] = await pool.query(
            `SELECT p.packID, p.packTYPE, p.packCOST, p.PRICING_TYPE
             FROM DPX_TRIP_PACKAGE t
             JOIN DPX_PACKAGE p ON t.packID = p.packID
             WHERE t.tripID = ?`,
            [tripID]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching trip packages');
    }
});

// 向 trip 添加 package
router.post('/add', async (req, res) => {
    const { tripID, packID } = req.body;

    if (!tripID || !packID) return res.status(400).send('Missing tripID or packID');

    try {
        // 检查是否已存在
        const [existing] = await pool.query(
            'SELECT * FROM DPX_TRIP_PACKAGE WHERE tripID = ? AND packID = ?',
            [tripID, packID]
        );

        if (existing.length > 0) {
            return res.status(400).send('Package already exists for this trip');
        }

        // 插入关联
        await pool.query(
            'INSERT INTO DPX_TRIP_PACKAGE (tripID, packID) VALUES (?, ?)',
            [tripID, packID]
        );
        res.send('Package added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding package to trip');
    }
});

// 从 trip 删除 package
// router.delete('/remove', async (req, res) => {
//     const { tripID, packID } = req.body;

//     if (!tripID || !packID) return res.status(400).send('Missing tripID or packID');

//     try {
//         const [result] = await pool.query(`
//                     DELETE p, t
//                     FROM dpx_pass_package p
//                     JOIN dpx_trip_package t ON p.trippackid = t.trippackid
//                     WHERE t.tripID = ? AND t.packID = ?;
//         `, [tripID, packID]
//         );

//         if (result.affectedRows === 0) {
//             return res.status(404).send('Package not found for this trip');
//         }

//         res.send('Package removed successfully');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error removing package from trip');
//     }
// });

module.exports = router;
