const express = require('express');
const router = express.Router();
const db = require('../util/db');

// 获取已保存的乘客信息
router.get('/saved', async (req, res) => {
    const { userid } = req.query; // 从查询参数中获取 userid

    if (!userid) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const [results] = await db.execute(`
            SELECT pi.* 
            FROM dpx_saved_pass sp
            JOIN dpx_passenger_info pi ON sp.passinfoid = pi.passinfoid
            WHERE sp.userid = ?
        `, [userid]);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch saved passengers' });
    }
});

router.delete('/delete', async (req, res) => {
    const { userid, passinfoid } = req.body;
    const connection = await db.getConnection();
    try {
        // 开始事务
        await connection.query('START TRANSACTION');

        // 删除 dpx_saved_pass 表中的记录
        await connection.query(`
            DELETE FROM dpx_saved_pass WHERE userid = ? AND passinfoid = ?
        `, [userid, passinfoid]);

        // 删除 dpx_passenger_info 表中的记录
        await connection.query(`
            DELETE FROM dpx_passenger_info WHERE passinfoid = ?
        `, [passinfoid]);

        // 提交事务
        await connection.query('COMMIT');
        res.status(200).json({ message: 'Passenger deleted successfully' });
    } catch (err) {
        console.error(err);
        await connection.query('ROLLBACK');
        res.status(500).json({ message: 'Failed to delete passenger' });
    }
});

// 创建新的乘客信息
router.post('/create', async (req, res) => {
    const { fname, lname, birthdate, street, city, state, country, zipcode, gender, nationality, email, phone } = req.body;
    try {
        const [result] = await db.execute(`
            INSERT INTO dpx_passenger_info (fname, lname, birthdate, street, city, state, country, zipcode, gender, nationality, email, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [fname, lname, birthdate, street, city, state, country, zipcode, gender, nationality, email, phone]);
        res.status(201).json({ passinfoid: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create passenger info' });
    }
});

// 保存乘客信息到当前用户
router.post('/save', async (req, res) => {
    const { userid, passinfoid } = req.body; // 从请求体中获取 userid 和 passinfoid

    if (!userid || !passinfoid) {
        return res.status(400).json({ message: 'User ID and Passenger Info ID are required' });
    }

    try {
        await db.execute(`
            INSERT INTO dpx_saved_pass (userid, passinfoid)
            VALUES (?, ?)
        `, [userid, passinfoid]);
        res.status(201).json({ message: 'Passenger info saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save passenger info' });
    }
});

// 创建 dpx_group 行
router.post('/group/create', async (req, res) => {
    const { tripid, group_size } = req.body;

    if (!tripid || !group_size) {
        return res.status(400).json({ message: 'Trip ID and Group Size are required' });
    }

    try {
        const [result] = await db.execute(`
            INSERT INTO dpx_group (tripid, group_size)
            VALUES (?, ?)
        `, [tripid, group_size]);

        const groupid = result.insertId; // 获取新创建的 groupid
        res.status(201).json({ groupid });
    } catch (err) {
        console.error('Failed to create group:', err);
        res.status(500).json({ message: 'Failed to create group' });
    }
});

// 创建 dpx_passenger 行
router.post('/group', async (req, res) => {
    const { groupid, passinfoid, roomid } = req.body;

    if (!groupid || !passinfoid) {
        return res.status(400).json({ message: 'Group ID and Passenger Info ID are required' });
    }

    try {
        await db.execute(`
            INSERT INTO dpx_passenger (groupid, roomid, passinfoid)
            VALUES (?, ?, ?)
        `, [groupid, roomid, passinfoid]);

        res.status(201).json({ message: 'Passenger added to group successfully' });
    } catch (err) {
        console.error('Failed to add passenger to group:', err);
        res.status(500).json({ message: 'Failed to add passenger to group' });
    }
});


module.exports = router;
