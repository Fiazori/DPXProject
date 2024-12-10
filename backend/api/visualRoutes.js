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

// 获取每日报价单数量
router.get('/invoice-count', async (req, res) => {
    const { tripid } = req.query;
    if (!tripid) return res.status(400).send('Missing tripid parameter');

    try {
        // 查询所有与 tripid 相关的报价单日期
        const [invoices] = await pool.query('SELECT duedate FROM dpx_invoice WHERE tripid = ?', [tripid]);

        // 按日统计 inID 数量
        const dateCount = invoices.reduce((acc, invoice) => {
            // 将 duedate 减去一个月
            const dueDate = new Date(invoice.duedate);
            const actualDate = new Date(dueDate.setMonth(dueDate.getMonth() - 1)); // 减去一个月

            const key = actualDate.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
            acc[key] = (acc[key] || 0) + 1; // 统计每个日期的 inID 数量
            return acc;
        }, {});

        res.json(dateCount);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching invoice count data');
    }
});



module.exports = router;
