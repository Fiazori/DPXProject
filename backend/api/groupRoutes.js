const express = require('express');
const router = express.Router();
const db = require('../util/db');

// 获取 group 中的乘客信息
router.get('/passengers', async (req, res) => {
    const { groupid } = req.query;

    if (!groupid) {
        return res.status(400).json({ message: 'Group ID is required' });
    }

    try {

        const [results] = await db.execute(`
            SELECT p.passengerid, pi.fname, pi.lname, pi.email
            FROM dpx_passenger p
            JOIN dpx_passenger_info pi ON p.passinfoid = pi.passinfoid
            WHERE p.groupid = ?
        `, [groupid]);

        res.json(results);
    } catch (err) {
        console.error('Failed to fetch passengers:', err);
        res.status(500).json({ message: 'Failed to fetch passengers' });
    }
});

// Create group
router.post('/create', async (req, res) => {
    const { tripid, group_size } = req.body;

    if (!tripid || !group_size) {
        return res.status(400).json({ message: 'Trip ID and Group Size are required' });
    }

    try {
        const start = Date.now();
        const [result] = await db.execute(`
            INSERT INTO dpx_group (tripid, group_size)
            VALUES (?, ?)
        `, [tripid, group_size]);
        console.log('INSERT INTO dpx_group Query Time:', Date.now() - start, 'ms');
        const groupid = result.insertId;
        res.status(201).json({ groupid });
    } catch (err) {
        console.error('Failed to create group:', err);
        res.status(500).json({ message: 'Failed to create group' });
    }
});

// Assign passengers to group
router.post('/assign', async (req, res) => {
    const { groupid, passengers } = req.body;

    if (!groupid || !passengers || passengers.length === 0) {
        return res.status(400).json({ message: 'Group ID and Passenger list are required' });
    }

    try {
        const values = passengers.map((passenger) => [groupid, passenger.passinfoid, null]);

        await db.query(`
            INSERT INTO dpx_passenger (groupid, passinfoid, roomid)
            VALUES ?
        `, [values]);

        res.status(201).json({ message: 'Passengers assigned successfully' });
    } catch (err) {
        console.error('Failed to assign passengers:', err);
        res.status(500).json({ message: 'Failed to assign passengers' });
    }
});

module.exports = router;
