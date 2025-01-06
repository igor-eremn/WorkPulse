import express from 'express';
import { ObjectId } from 'mongodb';
import client from '../mongoClient.js';
import moment from 'moment-timezone';

const router = express.Router();
const db = client.db('DB1');
const attendanceCollection = db.collection('attendance');
const employeesCollection = db.collection('employees');

const getLocalTime = () => moment().tz('America/Los_Angeles').format();
const getTodayStart = () => moment().tz('America/Los_Angeles').startOf('day').toISOString();

// 10 min - 0.17 h, 15 min - 0.25 h, 
// 20 min - 0.33 h, 25 min - 0.42 h, 
// 30 min - 0.50 h, 35 min - 0.58 h, 
// 40 min - 0.67 h, 45 min - 0.75 h, 
// 50 min - 0.83 h, 55 min - 0.92 h,
const calculateDuration = (start, end, breakIn, breakOut) => {
    if (!start || !end) return 0;

    const startDateTime = moment(start);
    const endDateTime = moment(end);
    let totalDuration = endDateTime.diff(startDateTime, 'hours', true);

    if (breakIn && breakOut) {
        const breakInTime = moment(breakIn);
        const breakOutTime = moment(breakOut);
        const breakDuration = breakOutTime.diff(breakInTime, 'hours', true);

        totalDuration -= breakDuration;
    }

    return parseFloat(totalDuration.toFixed(2));
};

// Helper function for error handling
const handleError = (res, err) => {
    console.error(err.message);
    res.status(500).json({ error: err.message });
};

// Clock-In
router.post('/attendance/clock-in', async (req, res) => {
    const { employee_id } = req.body;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received clock-in request for user with id: ", employee_id);
    try {
        const todayStart = moment().tz('America/Los_Angeles').startOf('day').format();
        const todayEnd = moment().tz('America/Los_Angeles').endOf('day').format();

        const existingRecord = await attendanceCollection.findOne({
            employee_id: new ObjectId(employee_id),
            clock_in_time: { $gte: todayStart, $lte: todayEnd },
        });

        if (existingRecord) {
            console.log("📊⚠️ User with id: ", employee_id, " has already clocked in today");
            return res.status(400).json({ error: 'You have already clocked in today' });
        }

        const clockInTime = moment().tz('America/Los_Angeles').format();
        const result = await attendanceCollection.insertOne({
            employee_id: new ObjectId(employee_id),
            clock_in_time: clockInTime,
            break_in_time: null,
            break_out_time: null,
            clock_out_time: null,
        });

        console.log("📊✅ User with id: ", employee_id, " clocked in successfully at ", clockInTime);
        res.status(201).json({ id: result.insertedId, message: 'Clock-in successful', clock_in_time: clockInTime });
    } catch (err) {
        console.error("📊❌ Error during clock-in:", err.message);
        res.status(500).json({ error: 'An error occurred during clock-in' });
    }
});

// Break-In
router.put('/attendance/break-in', async (req, res) => {
    const { employee_id } = req.body;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received break-in reqest for user with id: ", employee_id);
    try {
        const todayStart = getTodayStart();

        const record = await attendanceCollection.findOne({
            employee_id: new ObjectId(employee_id),
            clock_in_time: { $gte: todayStart },
        });

        if (!record) {
            console.log("📊⚠️  User with id: ", employee_id, " has not clocked in today");
            return res.status(400).json({ error: 'No clock-in record found for today' });
        }

        if (record.break_in_time) {
            console.log("📊⚠️  User with id: ", employee_id, " has already started a break");
            return res.status(400).json({ error: 'Break has already started' });
        }

        const breakInTime = getLocalTime();
        await attendanceCollection.updateOne(
            { _id: record._id },
            { $set: { break_in_time: breakInTime } }
        );

        console.log("📊✅ User with id: ", employee_id, " started a break successfully");
        res.json({ message: 'Break-in time recorded' });
    } catch (err) {
        handleError(res, err);
    }
});

// Break-Out
router.put('/attendance/break-out', async (req, res) => {
    const { employee_id } = req.body;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received break-out reqest for user with id: ", employee_id);
    try {
        const todayStart = getTodayStart();

        const record = await attendanceCollection.findOne({
            employee_id: new ObjectId(employee_id),
            clock_in_time: { $gte: todayStart },
        });

        if (!record || !record.break_in_time) {
            console.log("📊⚠️  User with id: ", employee_id, " has not started a break today");
            return res.status(400).json({ error: 'Cannot break out without starting a break' });
        }

        if (record.break_out_time) {
            console.log("📊⚠️  User with id: ", employee_id, " has already ended the break");
            return res.status(400).json({ error: 'Break has already ended' });
        }

        const breakOutTime = getLocalTime();
        await attendanceCollection.updateOne(
            { _id: record._id },
            { $set: { break_out_time: breakOutTime } }
        );

        console.log("📊✅ User with id: ", employee_id, " ended the break successfully");
        res.json({ message: 'Break-out time recorded' });
    } catch (err) {
        handleError(res, err);
    }
});

// Clock-Out
router.put('/attendance/clock-out', async (req, res) => {
    const { employee_id } = req.body;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received clock-out request for user with id: ", employee_id);

    try {
        const todayStart = getTodayStart();

        const record = await attendanceCollection.findOne({
            employee_id: new ObjectId(employee_id),
            clock_in_time: { $gte: todayStart },
        });

        if (!record) {
            console.log("📊⚠️  User with id: ", employee_id, " has not clocked in today");
            return res.status(400).json({ error: 'No clock-in record found for today' });
        }

        if (record.clock_out_time) {
            console.log("📊⚠️  User with id: ", employee_id, " has already clocked out today");
            return res.status(400).json({ error: 'Already clocked out today' });
        }

        const clockOutTime = getLocalTime();
        await attendanceCollection.updateOne(
            { _id: record._id },
            { $set: { clock_out_time: clockOutTime } }
        );

        console.log("📊✅ User with id: ", employee_id, " clocked out successfully");
        res.json({ message: 'Clock-out time recorded' });
    } catch (err) {
        handleError(res, err);
    }
});

// Fetch Attendance Records
router.get('/attendance', async (req, res) => {
    try {
        const records = await attendanceCollection
            .find()
            .sort({ clock_in_time: -1 })
            .toArray();

        console.log("📊📊 Fetched attendance records successfully");
        res.json(records);
    } catch (err) {
        handleError(res, err);
    }
});

// Fetch Today's Attendance for an Employee
router.post('/attendance/today', async (req, res) => {
    const { employee_id } = req.body;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received request for today's attendance for user with id: ", employee_id);
    try {
        const todayStart = getTodayStart();

        const records = await attendanceCollection
            .find({
                employee_id: new ObjectId(employee_id),
                clock_in_time: { $gte: todayStart },
            })
            .sort({ clock_in_time: -1 })
            .toArray();

        console.log("📊📊 Fetched today's attendance records successfully");
        res.json(records);
    } catch (err) {
        handleError(res, err);
    }
});

// Fetch all attendance records for a specific employee (excluding today's records) sorted by date
router.get('/attendance/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received request for attendance records for user with id: ", employee_id);
    try {
        const todayStart = getTodayStart();

        const records = await attendanceCollection
            .find({
                employee_id: new ObjectId(employee_id),
                clock_in_time: { $lt: todayStart },
            })
            .sort({ clock_in_time: -1 })
            .toArray();

        console.log("📊📊 Fetched attendance records successfully");
        res.json(records);
    } catch (err) {
        handleError(res, err);
    }
});

// Fetch number of hours worked for a specific employee today
router.get('/attendance/hours/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received request for hours worked for user with id: ", employee_id);
    try {
        const todayStart = getTodayStart();

        const records = await attendanceCollection
            .find({
                employee_id: new ObjectId(employee_id),
                clock_in_time: { $gte: todayStart },
            })
            .sort({ clock_in_time: -1 })
            .toArray();

        let totalHours = 0;
        records.forEach((record) => {
            const duration = calculateDuration(record.clock_in_time, record.clock_out_time);
            totalHours += duration;
        });

        console.log("📊📊 Fetched hours worked successfully");
        res.json({ hours: totalHours });
    } catch (err) {
        handleError(res, err);
    }
});

// Fetch number of hours worked for a specific employee this month
router.get('/attendance/hours/month/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    console.log("📊📊 Received request for monthly hours worked for user with id: ", employee_id);

    try {
        const monthStart = moment().tz('America/Los_Angeles').startOf('month').toISOString();
        const monthEnd = moment().tz('America/Los_Angeles').endOf('month').toISOString();

        const records = await attendanceCollection
            .find({
                employee_id: new ObjectId(employee_id),
                clock_in_time: { $gte: monthStart, $lte: monthEnd },
            })
            .sort({ clock_in_time: 1 })
            .toArray();

        let totalHours = 0;

        records.forEach((record) => {
            const duration = calculateDuration(record.clock_in_time, record.clock_out_time, record.break_in_time, record.break_out_time);
            totalHours += duration;
        });

        console.log("📊📊 Fetched monthly hours worked successfully");
        res.json({ hours: totalHours.toFixed(2) });
    } catch (err) {
        console.error("📊❌ Error fetching monthly hours:", err.message);
        res.status(500).json({ error: 'An error occurred while fetching monthly hours' });
    }
});

// Delete all attendance records
router.delete('/attendance', async (req, res) => {
    try {
        const result = await attendanceCollection.deleteMany({});
        console.log("📊📊 Deleted all attendance records successfully");
        res.json({ message: `${result.deletedCount} attendance records deleted` });
    } catch (err) {
        handleError(res, err);
    }
});

export default router;