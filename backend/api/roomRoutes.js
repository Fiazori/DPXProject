const express = require('express');
const router = express.Router();
const db = require('../util/db');

// 获取房型信息
router.get('/types', async (req, res) => {
    const { groupid } = req.query;

    if (!groupid) {
        return res.status(400).json({ message: 'Group ID is required' });
    }

    try {
        const [roomTypes] = await db.execute(`
            SELECT r.sid, s.type, s.bed, COUNT(r.roomid) AS emptyRooms, MIN(r.price) AS minPrice
            FROM dpx_pass_room r
            JOIN dpx_stateroom s ON r.sid = s.sid
            WHERE r.occupancy_status = 'N'
              AND r.tripid = (SELECT tripid FROM dpx_group WHERE groupid = ?)
            GROUP BY r.sid, s.type
        `, [groupid]);

        res.json(roomTypes);
    } catch (err) {
        console.error('Failed to fetch room types:', err);
        res.status(500).json({ message: 'Failed to fetch room types' });
    }
});

// 获取具体房间信息
router.get('/available', async (req, res) => {
    const { groupid, sid } = req.query;

    if (!groupid || !sid) {
        return res.status(400).json({ message: 'Group ID and SID are required' });
    }

    try {
        const [rooms] = await db.execute(`
            SELECT r.roomid, r.roomnumber, r.price, l.location_side, s.bed
            FROM dpx_pass_room r
            JOIN dpx_location l ON r.locaid = l.locaid
            JOIN dpx_stateroom s ON r.sid = s.sid
            WHERE r.occupancy_status = 'N'
              AND r.sid = ?
              AND r.tripid = (SELECT tripid FROM dpx_group WHERE groupid = ?)
        `, [sid, groupid]);

        res.json(rooms);
    } catch (err) {
        console.error('Failed to fetch rooms:', err);
        res.status(500).json({ message: 'Failed to fetch rooms' });
    }
});

router.post('/remove', async (req, res) => {
    const { roomid } = req.body;

    if (!roomid) {
        return res.status(400).json({ message: 'Room ID is required' });
    }

    try {
        // 将所有与该房间关联的乘客的 roomid 设置为 null
        await db.execute(`
            UPDATE dpx_passenger
            SET roomid = NULL
            WHERE roomid = ?
        `, [roomid]);
        await db.execute(`
            UPDATE dpx_pass_room
            SET OCCUPANCY_STATUS = 'N', groupid = NULL
            WHERE roomid = ?
        `, [roomid]);
        
        res.status(200).json({ message: 'Room passengers removed successfully' });
    } catch (err) {
        console.error('Failed to remove room passengers:', err);
        res.status(500).json({ message: 'Failed to remove room passengers' });
    }
});


router.post('/occupy', async (req, res) => {
    const { roomid, groupid, status } = req.body;

    if (!roomid || !status) {
        return res.status(400).json({ message: 'Room ID and Status are required' });
    }

    try {
        await db.execute(`
            UPDATE dpx_pass_room
            SET occupancy_status = ?, groupid = ?
            WHERE roomid = ?
        `, [status, groupid, roomid]);

        res.status(200).json({ message: 'Room status updated successfully' });
    } catch (err) {
        console.error('Failed to update room status:', err);
        res.status(500).json({ message: 'Failed to update room status' });
    }
});

module.exports = router;
