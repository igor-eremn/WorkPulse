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
        res.json(users);
    } catch (err) {
        console.error('Error fetching regular users:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete all employees
router.delete('/employees', async (req, res) => {
    try {
        const result = await employeesCollection.deleteMany({});
        res.json({ message: `${result.deletedCount} employees deleted` });
    } catch (err) {
        console.error('Error deleting employees:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/*
// Get all regular users (role = 0) and their total hours worked today
router.get('/employees/user/today', (req, res) => {
    const query = `
        SELECT 
            e.id,
            e.name,
            e.role,
            IFNULL(
                printf(
                    '%02d:%02d.%02d',
                    CAST(SUM(
                        (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time))
                        - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))
                    ) / 3600 AS INTEGER), -- Hours
                    CAST(SUM(
                        (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time))
                        - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))
                    ) % 3600 / 60 AS INTEGER), -- Minutes
                    CAST(SUM(
                        (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time))
                        - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))
                    ) % 60 AS INTEGER) -- Seconds
                ),
                '00:00.00'
            ) AS hours_worked_today
        FROM 
            employees e
        LEFT JOIN 
            attendance a ON e.id = a.employee_id
            AND date(a.clock_in_time) = date('now', 'localtime') -- Filter for today's date
        WHERE 
            e.role = 0
        GROUP BY 
            e.id;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get all regular users (role = 0) and their total hours worked
router.get('/employees/user/total', (req, res) => {
    const query = `
        SELECT 
            e.id,
            e.name,
            IFNULL(
                ROUND(SUM(
                    CASE 
                        WHEN a.clock_out_time IS NOT NULL THEN 
                            (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time)
                             - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                        ELSE 
                            (strftime('%s', 'now', 'localtime') - strftime('%s', a.clock_in_time)
                             - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                    END
                ), 2),
                0
            ) AS hours_worked
        FROM 
            employees e
        LEFT JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            e.role = 0
        GROUP BY 
            e.id
        ORDER BY 
            e.name ASC;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching total hours worked:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get all regular users (role = 0) and their total hours worked for a specific period
router.get('/employees/user/total/period', (req, res) => {
    const { startDate, endDate } = req.query;

    const query = `
        SELECT 
            e.id,
            e.name,
            IFNULL(
                ROUND(SUM(
                    CASE 
                        WHEN a.clock_out_time IS NOT NULL THEN 
                            (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time)
                             - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                        ELSE 
                            (strftime('%s', 'now', 'localtime') - strftime('%s', a.clock_in_time)
                             - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                    END
                ), 2),
                0
            ) AS hours_worked
        FROM 
            employees e
        LEFT JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            e.role = 0
            AND (date(a.clock_in_time) >= date(?)
                AND date(a.clock_in_time) <= date(?))
        GROUP BY 
            e.id
        ORDER BY 
            e.name ASC;
    `;

    db.all(query, [startDate, endDate], (err, rows) => {
        if (err) {
            console.error('Error fetching total hours worked for the period:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});
*/

export default router;