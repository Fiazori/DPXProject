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
            SELECT SUM(r.price * s.bed) AS totalRoomCost
            FROM dpx_pass_room r
            JOIN dpx_stateroom s ON r.sid = s.sid
            WHERE r.roomid IN (
                SELECT DISTINCT roomid
                FROM dpx_passenger
                WHERE groupid = ?
            )
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
            SELECT DISTINCT r.roomid, r.roomnumber, CAST(r.price * s.bed AS DECIMAL(10,2)) AS price
            FROM dpx_pass_room r
            JOIN dpx_passenger p ON p.roomid = r.roomid
            JOIN dpx_stateroom s ON r.sid = s.sid
            WHERE p.groupid = ?
        `, [groupid]);;

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

        // 获取总付款金额和到期日
        const [invoice] = await db.execute(`
            SELECT totalamount, duedate, IFNULL(SUM(p.payamount), 0) AS totalPaid
            FROM dpx_invoice i
            LEFT JOIN dpx_payment p ON i.inid = p.inid
            WHERE i.groupid = ? AND i.tripid = ?
            GROUP BY i.inid
        `, [groupid, tripid]);

        if (invoice.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const { totalamount, duedate, totalPaid } = invoice[0];

        res.status(200).json({
            roomDetails,
            packageDetails,
            totalRoomCost,
            totalPackageCost,
            totalAmount: parseFloat(totalamount),
            totalPaid: parseFloat(totalPaid),
            dueDate: duedate,
        });
    } catch (err) {
        console.error('Failed to fetch invoice details:', err);
        res.status(500).json({ message: 'Failed to fetch invoice details' });
    }
});


router.post('/payment', async (req, res) => {
    const { inid, payamount, paymethod } = req.body;

    if (!inid || !payamount || !paymethod) {
        return res.status(400).json({ message: 'Invoice ID, Payment Amount, and Payment Method are required' });
    }

    try {
        // 获取当前 Invoice 的总金额和已付款金额
        const [invoice] = await db.execute(`
            SELECT totalamount, 
                   IFNULL(SUM(p.payamount), 0) AS totalPaid
            FROM dpx_invoice i
            LEFT JOIN dpx_payment p ON i.inid = p.inid
            WHERE i.inid = ?
            GROUP BY i.inid
        `, [inid]);

        if (invoice.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const { totalamount, totalPaid } = invoice[0];
        const remainingAmount = totalamount - totalPaid;

        if (payamount > remainingAmount) {
            return res.status(400).json({ message: 'Payment amount exceeds remaining balance' });
        }

        // 确定付款类型
        const paytype = payamount < remainingAmount ? 'Installment' : 'Full Payment';

        // 插入付款记录
        await db.execute(`
            INSERT INTO dpx_payment (paydate, payamount, paymethod, paytype, inid)
            VALUES (CURDATE(), ?, ?, ?, ?)
        `, [payamount, paymethod, paytype, inid]);

        return res.status(201).json({ message: 'Payment recorded successfully', paytype });
    } catch (err) {
        console.error('Failed to record payment:', err);
        res.status(500).json({ message: 'Failed to record payment' });
    }
});

router.get('/payment-history', async (req, res) => {
    const { inid } = req.query;

    if (!inid) {
        return res.status(400).json({ message: 'Invoice ID is required' });
    }

    try {
        const [paymentHistory] = await db.execute(`
            SELECT paymentid, paydate, payamount, paymethod, paytype
            FROM dpx_payment
            WHERE inid = ?
            ORDER BY paydate DESC
        `, [inid]);

        res.status(200).json(paymentHistory);
    } catch (err) {
        console.error('Failed to fetch payment history:', err);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
});



module.exports = router;
