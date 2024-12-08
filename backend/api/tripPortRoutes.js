const express = require('express');
const router = express.Router();
const pool = require('../util/db');

// 获取所有 Port 的基本信息并缓存备用
router.get('/ports', async (req, res) => {
    try {
        const [ports] = await pool.query('SELECT portid, pname FROM dpx_port');
        res.json(ports);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching ports');
    }
});

// 获取当前 trip 的所有 Trip Ports
router.get('/tripPorts', async (req, res) => {
    const { tripID } = req.query;

    if (!tripID) return res.status(400).send('Missing tripID parameter');

    try {
        const [tripPorts] = await pool.query(
            `SELECT tp.tripportid, tp.sequence_number, tp.arrivaltime, tp.departuretime, tp.portid, p.pname
             FROM dpx_trip_port tp
             JOIN dpx_port p ON tp.portid = p.portid
             WHERE tp.tripid = ?
             ORDER BY tp.sequence_number`,
            [tripID]
        );
        res.json(tripPorts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching trip ports');
    }
});

// 更新 Trip Ports 顺序
router.put('/updateOrder', async (req, res) => {
    const { tripID, tripPorts } = req.body;

    if (!tripID || !Array.isArray(tripPorts)) {
        return res.status(400).send('Missing or invalid tripID or tripPorts');
    }

    try {
        const queries = tripPorts.map(({ tripportid, sequence_number }) =>
            pool.query('UPDATE dpx_trip_port SET sequence_number = ? WHERE tripportid = ?', [sequence_number, tripportid])
        );

        // 等待所有更新操作完成
        await Promise.all(queries);

        // 更新 trip 的 start_port 和 end_port
        const [firstPort] = await pool.query(
            'SELECT portid FROM dpx_trip_port WHERE tripid = ? ORDER BY sequence_number ASC LIMIT 1',
            [tripID]
        );
        const [lastPort] = await pool.query(
            'SELECT portid FROM dpx_trip_port WHERE tripid = ? ORDER BY sequence_number DESC LIMIT 1',
            [tripID]
        );

        if (firstPort.length && lastPort.length) {
            await pool.query(
                'UPDATE dpx_trip SET start_port = ?, end_port = ? WHERE tripid = ?',
                [firstPort[0].portid, lastPort[0].portid, tripID]
            );
        }

        res.send('Trip port order updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating trip port order');
    }
});

// 更新单个 Trip Port 的时间
router.put('/updateTimes', async (req, res) => {
    const { tripportid, arrivaltime, departuretime } = req.body;

    if (!tripportid || !arrivaltime || !departuretime) {
        return res.status(400).send('Missing tripportid, arrivaltime, or departuretime');
    }

    try {
        await pool.query(
            'UPDATE dpx_trip_port SET arrivaltime = ?, departuretime = ? WHERE tripportid = ?',
            [arrivaltime, departuretime, tripportid]
        );
        res.send('Trip port times updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating trip port times');
    }
});

// 删除 Trip Port
router.delete('/delete', async (req, res) => {
    const { tripportid, tripID } = req.body;

    if (!tripportid || !tripID) return res.status(400).send('Missing tripportid or tripID');

    try {
        await pool.query('DELETE FROM dpx_trip_port WHERE tripportid = ?', [tripportid]);

        // 重新排序 sequence_number
        const [remainingPorts] = await pool.query(
            'SELECT tripportid FROM dpx_trip_port WHERE tripid = ? ORDER BY sequence_number',
            [tripID]
        );

        const queries = remainingPorts.map((port, index) =>
            pool.query('UPDATE dpx_trip_port SET sequence_number = ? WHERE tripportid = ?', [index + 1, port.tripportid])
        );

        await Promise.all(queries);

        // 更新 start_port 和 end_port
        const [firstPort] = await pool.query(
            'SELECT portid FROM dpx_trip_port WHERE tripid = ? ORDER BY sequence_number ASC LIMIT 1',
            [tripID]
        );
        const [lastPort] = await pool.query(
            'SELECT portid FROM dpx_trip_port WHERE tripid = ? ORDER BY sequence_number DESC LIMIT 1',
            [tripID]
        );

        if (firstPort.length && lastPort.length) {
            await pool.query(
                'UPDATE dpx_trip SET start_port = ?, end_port = ? WHERE tripid = ?',
                [firstPort[0].portid, lastPort[0].portid, tripID]
            );
        }

        res.send('Trip port deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting trip port');
    }
});

// 添加新的 Trip Port
router.post('/add', async (req, res) => {
    const { tripID, portID, arrivaltime, departuretime } = req.body;

    if (!tripID || !portID || !arrivaltime || !departuretime) {
        return res.status(400).send('Missing tripID, portID, arrivaltime, or departuretime');
    }

    try {
        const [currentMaxSequence] = await pool.query(
            'SELECT MAX(sequence_number) AS maxSeq FROM dpx_trip_port WHERE tripid = ?',
            [tripID]
        );
        const sequenceNumber = (currentMaxSequence[0]?.maxSeq || 0) + 1;

        await pool.query(
            'INSERT INTO dpx_trip_port (sequence_number, arrivaltime, departuretime, portid, tripid) VALUES (?, ?, ?, ?, ?)',
            [sequenceNumber, arrivaltime, departuretime, portID, tripID]
        );

        // 更新 start_port 和 end_port
        const [firstPort] = await pool.query(
            'SELECT portid FROM dpx_trip_port WHERE tripid = ? ORDER BY sequence_number ASC LIMIT 1',
            [tripID]
        );
        const [lastPort] = await pool.query(
            'SELECT portid FROM dpx_trip_port WHERE tripid = ? ORDER BY sequence_number DESC LIMIT 1',
            [tripID]
        );

        if (firstPort.length && lastPort.length) {
            await pool.query(
                'UPDATE dpx_trip SET start_port = ?, end_port = ? WHERE tripid = ?',
                [firstPort[0].portid, lastPort[0].portid, tripID]
            );
        }

        res.send('Trip port added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding trip port');
    }
});

module.exports = router;
