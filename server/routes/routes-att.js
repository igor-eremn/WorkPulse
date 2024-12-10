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

router.put('/attendance/break-in/:id', (req, res) => {
    const { id } = req.params;

    const checkQuery = `SELECT break_in_time FROM attendance WHERE id = ?`;

    db.get(checkQuery, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row.break_in_time) {
            return res.status(400).json({ error: 'Break has already started or ended' });
        }

        const updateQuery = `UPDATE attendance SET break_in_time = datetime('now') WHERE id = ?`;
        db.run(updateQuery, [id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Break-in time recorded' });
        });
    });
});

router.put('/attendance/break-out/:id', (req, res) => {
    const { id } = req.params;

    const checkQuery = `SELECT break_in_time, break_out_time FROM attendance WHERE id = ?`;

    db.get(checkQuery, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row.break_in_time) {
            return res.status(400).json({ error: 'Cannot break out without starting a break' });
        }

        if (row.break_out_time) {
            return res.status(400).json({ error: 'Break has already ended' });
        }
        
        const updateQuery = `UPDATE attendance SET break_out_time = datetime('now') WHERE id = ?`;
        db.run(updateQuery, [id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Break-out time recorded' });
        });
    });
});

router.put('/attendance/clock-out/:id', (req, res) => {
    const { id } = req.params;
    const query = `UPDATE attendance SET clock_out_time = datetime('now') WHERE id = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Clock-out time recorded' });
        }
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

//test route to delete all data from the database
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