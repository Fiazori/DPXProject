const express = require('express');
const router = express.Router();
const db = require('../util/db');
const Decimal = require('decimal.js');


// 创建或更新 Invoice
router.post('/create-or-update', async (req, res) => {
    const { groupid, tripid } = req.body;

    if (!groupid || !tripid) {
        return res.status(400).json({ message: 'Group ID and Trip ID are required' });
    }

    try {
        // 获取房间价格总计
        const [rooms] = await db.execute(`
            SELECT SUM(r.price) AS totalRoomCost
            FROM dpx_passenger p
            JOIN dpx_pass_room r ON p.roomid = r.roomid
            WHERE p.groupid = ?
        `, [groupid]);

        const totalRoomCost = new Decimal(rooms[0]?.totalRoomCost || 0);

        // 获取套餐价格总计
        const [packages] = await db.execute(`
            SELECT SUM(
                CASE
                    WHEN p.pricing_type = 'person/night' THEN p.packcost * t.night
                    ELSE p.packcost
                END
            ) AS totalPackageCost
            FROM dpx_pass_package pp
            JOIN dpx_trip_package tp ON pp.trippackid = tp.trippackid
            JOIN dpx_package p ON tp.packid = p.packid
            JOIN dpx_trip t ON tp.tripid = t.tripid
            JOIN dpx_passenger psg ON pp.passengerid = psg.passengerid
            WHERE psg.groupid = ?

        `, [groupid]);

        const totalPackageCost = new Decimal(packages[0]?.totalPackageCost || 0);
        console.log(totalPackageCost, totalRoomCost);
        // 使用 Decimal 计算总金额
        const totalAmount = totalRoomCost.plus(totalPackageCost).toNumber();

        // 检查是否已存在 Invoice
        const [existingInvoice] = await db.execute(`
            SELECT inid FROM dpx_invoice WHERE groupid = ? AND tripid = ?
        `, [groupid, tripid]);

        if (existingInvoice.length > 0) {
            // 更新 Invoice
            const inid = existingInvoice[0].inid;
            await db.execute(`
                UPDATE dpx_invoice
                SET totalamount = ?
                WHERE inid = ?
            `, [totalAmount, inid]);

            return res.status(200).json({ message: 'Invoice updated successfully', inid, totalAmount });
        } else {
            // 创建新 Invoice
            const [result] = await db.execute(`
                INSERT INTO dpx_invoice (totalamount, duedate, tripid, groupid)
                VALUES (?, DATE_ADD(CURDATE(), INTERVAL 30 DAY), ?, ?)
            `, [totalAmount, tripid, groupid]);

            return res.status(201).json({ message: 'Invoice created successfully', inid: result.insertId, totalAmount });
        }
    } catch (err) {
        console.error('Failed to create or update invoice:', err);
        res.status(500).json({ message: 'Failed to create or update invoice' });
    }
});

router.get('/details', async (req, res) => {
    const { groupid, tripid } = req.query;

    if (!groupid || !tripid) {
        return res.status(400).json({ message: 'Group ID and Trip ID are required' });
    }

    try {
        // 获取房间明细
        const [roomDetails] = await db.execute(`
            SELECT r.roomnumber, CAST(r.price AS DECIMAL(10,2)) AS price
            FROM dpx_pass_room r
            JOIN dpx_passenger p ON p.roomid = r.roomid
            WHERE p.groupid = ?

        `, [groupid]);
        const totalRoomCost = roomDetails.reduce((sum, room) => sum + parseFloat(room.price || 0), 0);
        
        // 获取套餐明细
        const [packageDetails] = await db.execute(`
            SELECT pp.passengerid, pi.fname, pi.lname, p.packtype, 
                CASE
                    WHEN p.pricing_type = 'person/night' THEN p.packcost * t.night
                    ELSE p.packcost
                END AS packageCost
            FROM dpx_pass_package pp
            JOIN dpx_trip_package tp ON pp.trippackid = tp.trippackid
            JOIN dpx_package p ON tp.packid = p.packid
            JOIN dpx_trip t ON tp.tripid = t.tripid
            JOIN dpx_passenger psg ON pp.passengerid = psg.passengerid
            JOIN dpx_passenger_info pi ON psg.passinfoid = pi.passinfoid
            WHERE psg.groupid = ?

        `, [groupid]);
        const totalPackageCost = packageDetails.reduce((sum, pkg) => sum + parseFloat(pkg.packageCost || 0), 0);

        res.status(200).json({
            roomDetails,
            packageDetails,
            totalRoomCost,
            totalPackageCost,
        });
    } catch (err) {
        console.error('Failed to fetch invoice details:', err);
        res.status(500).json({ message: 'Failed to fetch invoice details' });
    }
});


module.exports = router;
