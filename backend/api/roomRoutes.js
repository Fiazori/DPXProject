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

// 获取组的所有房间及乘客信息
router.get('/group-rooms', async (req, res) => {
    const { groupid } = req.query;

    if (!groupid) {
        return res.status(400).json({ message: 'Group ID is required' });
    }

    try {
        const [rooms] = await db.execute(`
            SELECT r.roomid, r.roomnumber, r.price, l.location_side, s.bed, s.type
            FROM dpx_pass_room r
            JOIN dpx_location l ON r.locaid = l.locaid
            JOIN dpx_stateroom s ON r.sid = s.sid
            WHERE r.groupid = ?
        `, [groupid]);

        const [passengers] = await db.execute(`
            SELECT p.passengerid, p.roomid, pi.fname, pi.lname
            FROM dpx_passenger p
            JOIN dpx_passenger_info pi ON p.passinfoid = pi.passinfoid
            WHERE p.groupid = ?
        `, [groupid]);

        const roomData = rooms.map((room) => ({
            ...room,
            passengers: passengers.filter((p) => p.roomid === room.roomid),
        }));

        res.json(roomData);
    } catch (err) {
        console.error('Failed to fetch group rooms:', err);
        res.status(500).json({ message: 'Failed to fetch group rooms' });
    }
});


router.post('/assign-passenger', async (req, res) => {
    const { roomid, passengerid } = req.body; // 接收 passengerid 而不是 passinfoid

    if (!roomid || !passengerid) {
        return res.status(400).json({ message: 'Room ID and Passenger ID are required' });
    }

    try {
        // 更新 dpx_passenger 表中的 roomid
        await db.execute(`
            UPDATE dpx_passenger
            SET roomid = ?
            WHERE passengerid = ?
        `, [roomid, passengerid]); // 使用 passengerid 作为条件

        res.status(200).json({ message: 'Passenger assigned to room successfully' });
    } catch (err) {
        console.error('Failed to assign passenger to room:', err);
        res.status(500).json({ message: 'Failed to assign passenger to room' });
    }
});

router.post('/remove-passenger', async (req, res) => {
    const { passengerid } = req.body;

    if (!passengerid) {
        return res.status(400).json({ message: 'Passenger ID is required' });
    }

    try {
        // 更新 dpx_passenger 表，将 roomid 设置为 NULL
        await db.execute(`
            UPDATE dpx_passenger
            SET roomid = NULL
            WHERE passengerid = ?
        `, [passengerid]);

        res.status(200).json({ message: 'Passenger removed from room successfully' });
    } catch (err) {
        console.error('Failed to remove passenger from room:', err);
        res.status(500).json({ message: 'Failed to remove passenger from room' });
    }
});

router.post('/delete-passenger', async (req, res) => {
    const { passengerid, groupid } = req.body;

    if (!passengerid || !groupid) {
        return res.status(400).json({ message: 'Passenger ID and Group ID are required' });
    }

    const connection = await db.getConnection(); // Get a connection from the pool
    try {
        await connection.query('START TRANSACTION'); // Start transaction

        // Delete the passenger from dpx_passenger
        await connection.query(`
            DELETE FROM dpx_passenger
            WHERE passengerid = ?
        `, [passengerid]);

        // Delete the passenger's package from dpx_pass_package
        await connection.query(`
            DELETE FROM dpx_pass_package
            WHERE passengerid = ?
        `, [passengerid]);

        // Recalculate the group size
        const [[{ group_size }]] = await connection.query(`
            SELECT COUNT(*) AS group_size
            FROM dpx_passenger
            WHERE groupid = ?
        `, [groupid]);

        // Update the group size in dpx_group
        await connection.query(`
            UPDATE dpx_group
            SET group_size = ?
            WHERE groupid = ?
        `, [group_size, groupid]);

        await connection.query('COMMIT'); // Commit transaction

        res.status(200).json({ message: 'Passenger deleted successfully and group size updated', group_size });
    } catch (err) {
        await connection.query('ROLLBACK'); // Rollback transaction on error
        console.error('Failed to delete passenger:', err);
        res.status(500).json({ message: 'Failed to delete passenger' });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
});



module.exports = router;
