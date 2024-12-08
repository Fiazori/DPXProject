const express = require('express');
const router = express.Router();
const pool = require('../util/db');

// 获取房间占用状态比例
router.get('/room-occupancy', async (req, res) => {
    const { tripid } = req.query;
    if (!tripid) return res.status(400).send('Missing tripid parameter');

    try {
        const [rooms] = await pool.query('SELECT occupancy_status FROM dpx_pass_room WHERE tripid = ?', [tripid]);
        const statusCount = rooms.reduce((acc, room) => {
            acc[room.occupancy_status] = (acc[room.occupancy_status] || 0) + 1;
            return acc;
        }, {});

        res.json(statusCount);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching room occupancy data');
    }
});

// 获取乘客国籍和性别分布
router.get('/passenger-distribution', async (req, res) => {
    const { tripid } = req.query;
    if (!tripid) return res.status(400).send('Missing tripid parameter');

    try {
        const [groups] = await pool.query('SELECT groupid FROM dpx_group WHERE tripid = ?', [tripid]);
        const groupIDs = groups.map(group => group.groupid);

        if (groupIDs.length === 0) return res.json({ nationality: {}, gender: {} });

        const [passengers] = await pool.query(
            'SELECT p.passinfoid FROM dpx_passenger p WHERE p.groupid IN (?)',
            [groupIDs]
        );

        const passInfoIDs = passengers.map(passenger => passenger.passinfoid);

        if (passInfoIDs.length === 0) return res.json({ nationality: {}, gender: {} });

        const [passengerInfo] = await pool.query(
            'SELECT nationality, gender FROM dpx_passenger_info WHERE passinfoid IN (?)',
            [passInfoIDs]
        );

        const nationalityCount = passengerInfo.reduce((acc, pass) => {
            acc[pass.nationality] = (acc[pass.nationality] || 0) + 1;
            return acc;
        }, {});

        const genderCount = passengerInfo.reduce((acc, pass) => {
            acc[pass.gender] = (acc[pass.gender] || 0) + 1;
            return acc;
        }, {});

        res.json({ nationality: nationalityCount, gender: genderCount });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching passenger distribution');
    }
});

// 获取每日报价单人数
router.get('/invoice-count', async (req, res) => {
    const { tripid } = req.query;
    if (!tripid) return res.status(400).send('Missing tripid parameter');

    try {
        const [invoices] = await pool.query('SELECT duedate FROM dpx_invoice WHERE tripid = ?', [tripid]);
        const [groups] = await pool.query('SELECT groupid, group_size FROM dpx_group WHERE tripid = ?', [tripid]);

        const dateCount = invoices.reduce((acc, invoice) => {
            const key = new Date(new Date(invoice.duedate).setDate(new Date(invoice.duedate).getDate() - 30))
                .toISOString()
                .split('T')[0];
            const groupSizeSum = groups.reduce((sum, group) => sum + group.group_size, 0);
            acc[key] = (acc[key] || 0) + groupSizeSum;
            return acc;
        }, {});

        res.json(dateCount);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching invoice count data');
    }
});

module.exports = router;
