import express from 'express';
import { ObjectId } from 'mongodb';
import client from '../mongoClient.js';

const router = express.Router();

const db = client.db('DB1');
const employeesCollection = db.collection('employees');
const attendanceCollection = db.collection('attendance');

// Add a new employee
router.post('/employees', async (req, res) => {
    const { name, role, password } = req.body;

    try {
        const employee = { name, role, password };
        const result = await employeesCollection.insertOne(employee);

        console.log('✅ Employee added:', name);
        res.status(201).json({ id: result.insertedId, name });
    } catch (err) {
        console.error('Error adding employee:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await employeesCollection.find({}, { projection: { password: 0 } }).toArray();
        console.log('✅ Employees fetched:', employees.length);
        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Employee login
router.post('/employees/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const employee = await employeesCollection.findOne({ name });
        if (!employee) {
            console.log('❌ User not found:', name);
            return res.status(401).json({ error: 'User not found' });
        }

        const match = employee.password === password;
        if (!match) {
            console.log('❌ Invalid username or password');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        console.log('✅ User logged in:', name);
        res.json({ id: employee._id, role: employee.role });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all regular users (role = 0)
router.get('/employees/user', async (req, res) => {
    try {
        const users = await employeesCollection.find({ role: 0 }, { projection: { password: 0 } }).toArray();
        console.log('✅ Regular users fetched:', users.length);
        res.json(users);
    } catch (err) {
        console.error('Error fetching regular users:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all regular users (role = 0) and their total hours worked
router.get('/employees/user/total', async (req, res) => {
    try {
        const users = await employeesCollection.aggregate([
            { $match: { role: 0 } },
            {
                $lookup: {
                    from: 'attendance',
                    localField: '_id',
                    foreignField: 'employee_id',
                    as: 'attendance',
                },
            },
            {
                $addFields: {
                    total_hours_worked: {
                        $sum: {
                            $subtract: [
                                { $toSeconds: '$clock_out_time' },
                                { $toSeconds: '$clock_in_time' },
                            ],
                        },
                    },
                },
            },
        ]).toArray();

        console.log('✅ Regular users fetched:', users.length);
        res.json(users);
    } catch (err) {
        console.error('Error fetching regular users:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all regular users (role = 0) and their total hours worked for a specific period
router.get('/employees/user/total/period', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const users = await employeesCollection.aggregate([
            { $match: { role: 0 } },
            {
                $lookup: {
                    from: 'attendance',
                    localField: '_id',
                    foreignField: 'employee_id',
                    as: 'attendance',
                },
            },
            {
                $addFields: {
                    total_hours_worked: {
                        $sum: {
                            $subtract: [
                                { $toSeconds: '$clock_out_time' },
                                { $toSeconds: '$clock_in_time' },
                            ],
                        },
                    },
                },
            },
            {
                $match: {
                    'attendance.clock_in_time': { $gte: startDate, $lte: endDate },
                },
            },
        ]).toArray();

        console.log('✅ Regular users fetched:', users.length);
        res.json(users);
    } catch (err) {
        console.error('Error fetching regular users:', err.message);
        res.status(500).json({ error: err.message });
    }    
});

export default router;