const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/attendance/clock-in', (req, res) => {
    const { employee_id } = req.body;
    
    const checkQuery = `
        SELECT id 
        FROM attendance 
        WHERE employee_id = ? 
        AND date(clock_in_time) = date('now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            return res.status(400).json({ error: 'You have already clocked in today' });
        }

        const insertQuery = `
            INSERT INTO attendance (employee_id, clock_in_time) 
            VALUES (?, datetime('now', 'localtime'))
        `;
        db.run(insertQuery, [employee_id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({ id: this.lastID });
        });
    });
});

router.put('/attendance/break-in', (req, res) => {
    const { employee_id } = req.body;

    const checkQuery = `
        SELECT id, break_in_time 
        FROM attendance 
        WHERE employee_id = ? 
        AND strftime('%Y-%m-%d', clock_in_time) = strftime('%Y-%m-%d', 'now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(400).json({ error: 'No clock-in record found for today' });
        }

        if (row.break_in_time) {
            return res.status(400).json({ error: 'Break has already started or ended today' });
        }

        const updateQuery = `UPDATE attendance SET break_in_time = datetime('now', 'localtime') WHERE id = ?`;
        db.run(updateQuery, [row.id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Break-in time recorded' });
        });
    });
});

router.put('/attendance/break-out', (req, res) => {
    const { employee_id } = req.body;

    const checkQuery = `
        SELECT id, break_in_time, break_out_time 
        FROM attendance 
        WHERE employee_id = ? 
        AND strftime('%Y-%m-%d', clock_in_time) = strftime('%Y-%m-%d', 'now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row || !row.break_in_time) {
            return res.status(400).json({ error: 'Cannot break out without starting a break today' });
        }

        if (row.break_out_time) {
            return res.status(400).json({ error: 'Break has already ended today' });
        }

        const updateQuery = `UPDATE attendance SET break_out_time = datetime('now', 'localtime') WHERE id = ?`;
        db.run(updateQuery, [row.id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Break-out time recorded' });
        });
    });
});

router.put('/attendance/clock-out', (req, res) => {
    const { employee_id } = req.body;

    const checkQuery = `
        SELECT id, clock_out_time 
        FROM attendance 
        WHERE employee_id = ? 
        AND strftime('%Y-%m-%d', clock_in_time) = strftime('%Y-%m-%d', 'now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(400).json({ error: 'No clock-in record found for today' });
        }

        if (row.clock_out_time) {
            return res.status(400).json({ error: 'Already clocked out today' });
        }

        const updateQuery = `UPDATE attendance SET clock_out_time = datetime('now', 'localtime') WHERE id = ?`;
        db.run(updateQuery, [row.id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Clock-out time recorded' });
        });
    });
});

router.get('/attendance', (req, res) => {
    const query = `
        SELECT 
            a.id, e.name, a.clock_in_time, a.break_in_time, a.break_out_time, a.clock_out_time
        FROM 
            attendance a
        JOIN 
            employees e ON a.employee_id = e.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const result = rows.map(row => ({
                ...row,
                clock_in_time: row.clock_in_time ? new Date(row.clock_in_time + 'Z').toLocaleString() : null,
                break_in_time: row.break_in_time ? new Date(row.break_in_time + 'Z').toLocaleString() : null,
                break_out_time: row.break_out_time ? new Date(row.break_out_time + 'Z').toLocaleString() : null,
                clock_out_time: row.clock_out_time ? new Date(row.clock_out_time + 'Z').toLocaleString() : null
            }));
            res.json(result);
        }
    });
});

router.get('/attendance/today', (req, res) => {
    const { employee_id } = req.query;

    const query = `
        SELECT 
            a.id, e.name, a.clock_in_time, a.break_in_time, a.break_out_time, a.clock_out_time
        FROM 
            attendance a
        JOIN 
            employees e ON a.employee_id = e.id
        WHERE 
            a.employee_id = ?
        AND strftime('%Y-%m-%d', a.clock_in_time) = strftime('%Y-%m-%d', 'now', 'localtime')
    `;
    db.all(query, [employee_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const result = rows.map(row => ({
                ...row,
                clock_in_time: row.clock_in_time || null,
                break_in_time: row.break_in_time || null,
                break_out_time: row.break_out_time || null,
                clock_out_time: row.clock_out_time || null,
            }));
            res.json(result);
        }
    });
});

router.delete('/attendance', (req, res) => {
    const query = `DELETE FROM attendance`;
    db.run(query, [], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Attendance data deleted' });
        }
    });
});

module.exports = router;