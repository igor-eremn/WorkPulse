const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

router.post('/attendance/clock-in', (req, res) => {
    const { employee_id } = req.body;
    const query = `INSERT INTO attendance (employee_id, clock_in_time) VALUES (?, datetime('now'))`;
    db.run(query, [employee_id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID });
        }
    });
});

router.put('/attendance/break-in/:id', (req, res) => {
    const { id } = req.params;
    const query = `UPDATE attendance SET break_in_time = datetime('now') WHERE id = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Break-in time recorded' });
        }
    });
});

router.put('/attendance/break-out/:id', (req, res) => {
    const { id } = req.params;
    const query = `UPDATE attendance SET break_out_time = datetime('now') WHERE id = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Break-out time recorded' });
        }
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
            res.json(rows);
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