const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/employees', (req, res) => {
    const { name, password } = req.body;
    const query = `INSERT INTO employees (name, password) VALUES (?, ?)`;
    db.run(query, [name, password], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, name });
        }
    });
});

router.get('/employees', (req, res) => {
    const query = `SELECT id, name FROM employees`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;