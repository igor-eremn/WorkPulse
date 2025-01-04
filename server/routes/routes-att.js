import express from 'express';
import { ObjectId } from 'mongodb';
import client from '../mongoClient.js';

const router = express.Router();
const db = client.db('DB1');
const attendanceCollection = db.collection('attendance');
const employeesCollection = db.collection('employees');

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

    console.log("📊📊 Received clock-in reqest for user with id: ", employee_id);
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const existingRecord = await attendanceCollection.findOne({
            employee_id: new ObjectId(employee_id),
            clock_in_time: { $gte: todayStart },
        });

        if (existingRecord) {
            console.log("📊⚠️  User with id: ", employee_id, " has already clocked in today");
            return res.status(400).json({ error: 'You have already clocked in today' });
        }

        const clockInTime = new Date();
        const result = await attendanceCollection.insertOne({
            employee_id: new ObjectId(employee_id),
            clock_in_time: clockInTime,
            break_in_time: null,
            break_out_time: null,
            clock_out_time: null,
        });

        console.log("📊✅ User with id: ", employee_id, " clocked in successfully");
        res.status(201).json({ id: result.insertedId, message: 'Clock-in successful' });
    } catch (err) {
        handleError(res, err);
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
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

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

        await attendanceCollection.updateOne(
            { _id: record._id },
            { $set: { break_in_time: new Date() } }
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
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

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

        await attendanceCollection.updateOne(
            { _id: record._id },
            { $set: { break_out_time: new Date() } }
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

    console.log("📊📊 Received clock-out reqest for user with id: ", employee_id);
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

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

        await attendanceCollection.updateOne(
            { _id: record._id },
            { $set: { clock_out_time: new Date() } }
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

export default router;

/*
//Delete all attendance records
router.delete('/attendance', (req, res) => {
    const query = `DELETE FROM attendance`;
    db.run(query, [], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'All attendance records deleted' });
        }
    });
}); 

// Get all attendance records for a specific employee, excluding today's records, sorted by date
router.get('/attendance/:employee_id', (req, res) => {
    const { employee_id } = req.params;

    const query = `
        SELECT * 
        FROM attendance 
        WHERE employee_id = ?
        AND date(clock_in_time) < date('now', 'localtime')
        ORDER BY clock_in_time DESC
    `;

    db.all(query, [employee_id], (err, rows) => {
        if (err) {
            console.error('Error fetching attendance:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get number of hours worked for a specific employee this month
router.get('/attendance/hours/:employee_id', (req, res) => {
    const { employee_id } = req.params;

    const query = `
        SELECT 
            ROUND(SUM(
                CASE 
                    WHEN clock_out_time IS NOT NULL THEN 
                        (strftime('%s', clock_out_time) - strftime('%s', clock_in_time)) / 3600.0
                    ELSE 
                        (strftime('%s', 'now', 'localtime') - strftime('%s', clock_in_time)) / 3600.0
                END
            ), 2) AS hours_worked
        FROM attendance 
        WHERE employee_id = ?
        AND clock_in_time IS NOT NULL
        AND date(clock_in_time) >= date('now', 'start of month', 'localtime')
    `;

    db.get(query, [employee_id], (err, row) => {
        if (err) {
            console.error('Error fetching hours worked:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ hours_worked: row.hours_worked || 0 });
    });
});

export default router;*/