const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/employees', (req, res) => {
    const { name, role, password } = req.body;
    const query = `INSERT INTO employees (name, role, password) VALUES (?, ?, ?)`;
    db.run(query, [name, role, password], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, name });
        }
    });
});

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