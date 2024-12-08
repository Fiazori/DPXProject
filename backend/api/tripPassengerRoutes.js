const express = require('express');
const router = express.Router();
const pool = require('../util/db');

router.get('/passengers', async (req, res) => {
    const { tripid } = req.query;

    if (!tripid) return res.status(400).send('Missing tripid parameter');

    try {
        // 查找指定 TripID 的所有 Group，包括 group_size
        const [groups] = await pool.query(
            'SELECT groupid, group_size FROM dpx_group WHERE tripid = ?',
            [tripid]
        );

        const groupIDs = groups.map(group => group.groupid);

        if (groupIDs.length === 0) {
            return res.json([]);
        }

        // 查找 Group 中的所有 Passenger
        const [passengers] = await pool.query(
            'SELECT p.passengerid, p.groupid, p.roomid, p.passinfoid FROM dpx_passenger p WHERE p.groupid IN (?)',
            [groupIDs]
        );

        const passInfoIDs = passengers.map(passenger => passenger.passinfoid);

        if (passInfoIDs.length === 0) {
            return res.json([]);
        }

        // 查找 Passenger 信息
        const [passengerInfo] = await pool.query(
            'SELECT * FROM dpx_passenger_info WHERE passinfoid IN (?)',
            [passInfoIDs]
        );

        // 合并 Passenger 和 Passenger_Info 信息
        const result = groups.map(group => {
            const groupPassengers = passengers
                .filter(passenger => passenger.groupid === group.groupid)
                .map(passenger => {
                    const info = passengerInfo.find(info => info.passinfoid === passenger.passinfoid);
                    return { ...passenger, ...info };
                });
            return { groupid: group.groupid, group_size: group.group_size, passengers: groupPassengers };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching passenger information');
    }
});

module.exports = router;
