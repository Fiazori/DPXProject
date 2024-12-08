const express = require('express');
const router = express.Router();
const pool = require('../util/db');

// 获取所有 stateroom 和 location 信息
router.get('/options', async (req, res) => {
    try {
        const [staterooms] = await pool.query('SELECT sid, type, size, bed, bathroom, balcony FROM dpx_stateroom');
        const [locations] = await pool.query('SELECT locaid, location_side FROM dpx_location');
        res.json({ staterooms, locations });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching options');
    }
});

// 获取当前 trip 的所有房间信息
router.get('/rooms', async (req, res) => {
    const { tripID } = req.query;

    if (!tripID) return res.status(400).send('Missing tripID parameter');

    try {
        const [rooms] = await pool.query(
            `SELECT pr.roomid, pr.roomnumber, pr.price, pr.occupancy_status, pr.sid, pr.locaid, sr.type AS stateroom_type, sr.bed,
                    loc.location_side
             FROM dpx_pass_room pr
             JOIN dpx_stateroom sr ON pr.sid = sr.sid
             JOIN dpx_location loc ON pr.locaid = loc.locaid
             WHERE pr.tripid = ?`,
            [tripID]
        );
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching trip rooms');
    }
});

// 更新房间信息
router.put('/update', async (req, res) => {
    const { roomID, sid, locaid, price } = req.body;

    if (!roomID || !sid || !locaid || price === undefined) {
        return res.status(400).send('Missing roomID, sid, locaid, or price');
    }

    try {
        await pool.query(
            'UPDATE dpx_pass_room SET sid = ?, locaid = ?, price = ? WHERE roomid = ?',
            [sid, locaid, price, roomID]
        );
        res.send('Room updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating room');
    }
});

// 添加新房间
router.post('/add', async (req, res) => {
    const { tripID, roomNumber, sid, locaid, price } = req.body;

    if (!tripID || !roomNumber || !sid || !locaid || price === undefined) {
        return res.status(400).send('Missing tripID, roomNumber, sid, locaid, or price');
    }

    try {
        // 检查房间号是否唯一
        const [existing] = await pool.query(
            'SELECT roomnumber FROM dpx_pass_room WHERE tripid = ? AND roomnumber = ?',
            [tripID, roomNumber]
        );

        if (existing.length > 0) {
            return res.status(400).send('Room number already exists for this trip');
        }

        await pool.query(
            'INSERT INTO dpx_pass_room (roomnumber, tripid, sid, locaid, price, occupancy_status) VALUES (?, ?, ?, ?, ?, "N")',
            [roomNumber, tripID, sid, locaid, price]
        );

        res.send('Room added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding room');
    }
});

// 删除房间
router.delete('/delete', async (req, res) => {
    const { roomID } = req.body;

    if (!roomID) return res.status(400).send('Missing roomID');

    try {
        await pool.query('DELETE FROM dpx_pass_room WHERE roomid = ?', [roomID]);
        res.send('Room deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting room');
    }
});

module.exports = router;
