const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Generate custom employee IDs (e.g., 1001, 1002)
const generateEmployeeId = (callback) => {
    const query = `SELECT MAX(CAST(SUBSTR(id, 4) AS INTEGER)) AS max_id FROM employees`;
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error generating employee ID:', err.message);
            return callback(null);
        }
        const nextId = row.max_id ? `100${row.max_id + 1}` : '1001';
        callback(nextId);
    });
};

// Add a new employee
router.post('/employees', (req, res) => {
    const { name, role, password } = req.body;
    generateEmployeeId((id) => {
        if (!id) {
            return res.status(500).json({ error: 'Failed to generate employee ID' });
        }

        const query = `INSERT INTO employees (id, name, role, password) VALUES (?, ?, ?, ?)`;
        db.run(query, [id, name, role, password], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id, name });
            }
        });
    });
});

// Get all employees
router.get('/employees', (req, res) => {
    const query = `SELECT id, role, name FROM employees`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Employee login
router.post('/employees/login', (req, res) => {
    const { name, password } = req.body;
    const query = `SELECT id, role FROM employees WHERE name = ? AND password = ?`;
    db.get(query, [name, password], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            if (row) {
                res.json(row);
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        }
    });
});

// Get all regular users (role = 0)
router.get('/employees/user', (req, res) => {
    const query = `
        SELECT 
            e.id,
            e.name,
            e.role,
            IFNULL(SUM(
                (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time)) 
                - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))
            ) / 3600, 0) AS hours_worked
        FROM 
            employees e
        LEFT JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            e.role = 0
        GROUP BY 
            e.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Delete all employees
router.delete('/employees', (req, res) => {
    const query = `DELETE FROM employees`;
    db.run(query, [], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'All employees deleted' });
        }
    });
});

module.exports = router;