const express = require('express');
const router = express.Router();
const db = require('../util/db');

// 获取组内所有乘客信息
router.get('/group-passengers', async (req, res) => {
    const { groupid } = req.query;

    if (!groupid) {
        return res.status(400).json({ message: 'Group ID is required' });
    }

    try {
        const [passengers] = await db.execute(`
            SELECT p.passengerid, pi.fname, pi.lname
            FROM dpx_passenger p
            JOIN dpx_passenger_info pi ON p.passinfoid = pi.passinfoid
            WHERE p.groupid = ?
        `, [groupid]);

        res.json(passengers);
    } catch (err) {
        console.error('Failed to fetch passengers:', err);
        res.status(500).json({ message: 'Failed to fetch passengers' });
    }
});
// 获取行程的所有套餐信息
router.get('/trip-packages', async (req, res) => {
    const { tripid } = req.query;

    if (!tripid) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    try {
        const [packages] = await db.execute(`
            SELECT tp.trippackid, p.packid, p.packtype, p.packcost, p.pricing_type, p.is_available
            FROM dpx_trip_package tp
            JOIN dpx_package p ON tp.packid = p.packid
            WHERE tp.tripid = ?
        `, [tripid]);

        res.json(packages);
    } catch (err) {
        console.error('Failed to fetch trip packages:', err);
        res.status(500).json({ message: 'Failed to fetch trip packages' });
    }
});
// 获取乘客已选套餐
router.get('/passenger-packages', async (req, res) => {
    const { passengerid } = req.query;

    if (!passengerid) {
        return res.status(400).json({ message: 'Passenger ID is required' });
    }

    try {
        const [packages] = await db.execute(`
            SELECT pp.trippackid, p.packtype
            FROM dpx_pass_package pp
            JOIN dpx_trip_package tp ON pp.trippackid = tp.trippackid
            JOIN dpx_package p ON tp.packid = p.packid
            WHERE pp.passengerid = ?
        `, [passengerid]);

        res.json(packages);
    } catch (err) {
        console.error('Failed to fetch passenger packages:', err);
        res.status(500).json({ message: 'Failed to fetch passenger packages' });
    }
});
// 为乘客添加套餐
router.post('/add-package', async (req, res) => {
    const { trippackid, passengerid } = req.body;

    if (!trippackid || !passengerid) {
        return res.status(400).json({ message: 'Trip Package ID and Passenger ID are required' });
    }

    try {
        await db.execute(`
            INSERT INTO dpx_pass_package (trippackid, passengerid)
            VALUES (?, ?)
        `, [trippackid, passengerid]);

        res.status(200).json({ message: 'Package added successfully' });
    } catch (err) {
        console.error('Failed to add package:', err);
        res.status(500).json({ message: 'Failed to add package' });
    }
});

// 删除乘客的套餐
router.post('/remove-package', async (req, res) => {
    const { trippackid, passengerid } = req.body;

    if (!trippackid || !passengerid) {
        return res.status(400).json({ message: 'Trip Package ID and Passenger ID are required' });
    }

    try {
        await db.execute(`
            DELETE FROM dpx_pass_package
            WHERE trippackid = ? AND passengerid = ?
        `, [trippackid, passengerid]);

        res.status(200).json({ message: 'Package removed successfully' });
    } catch (err) {
        console.error('Failed to remove package:', err);
        res.status(500).json({ message: 'Failed to remove package' });
    }
});

module.exports = router;
