const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Helper function for error handling
const handleError = (res, err) => {
    console.error(err.message);
    res.status(500).json({ error: err.message });
};

const generateAttendanceId = (callback) => {
    const query = `SELECT MAX(CAST(SUBSTR(id, 4) AS INTEGER)) AS max_id FROM attendance`;
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error generating attendance ID:', err.message);
            return callback(null);
        }
        const nextId = row.max_id ? `200${row.max_id + 1}` : '2001';
        callback(nextId);
    });
};

// Clock-In
router.post('/attendance/clock-in', (req, res) => {
    const { employee_id } = req.body;
    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    const checkQuery = `
        SELECT id 
        FROM attendance 
        WHERE employee_id = ? 
        AND date(clock_in_time) = date('now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) return handleError(res, err);

        if (row) {
            return res.status(400).json({ error: 'You have already clocked in today' });
        }

        // Generate custom ID for the attendance record
        generateAttendanceId((id) => {
            if (!id) {
                return res.status(500).json({ error: 'Failed to generate attendance ID' });
            }

            const insertQuery = `
                INSERT INTO attendance (id, employee_id, clock_in_time) 
                VALUES (?, ?, datetime('now', 'localtime'))
            `;
            db.run(insertQuery, [id, employee_id], function (err) {
                if (err) return handleError(res, err);

                res.status(201).json({ id, message: 'Clock-in successful' });
            });
        });
    });
});

// Break-In
router.put('/attendance/break-in', (req, res) => {
    const { employee_id } = req.body;
    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    const checkQuery = `
        SELECT id, break_in_time 
        FROM attendance 
        WHERE employee_id = ? 
        AND date(clock_in_time) = date('now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) return handleError(res, err);

        if (!row) {
            return res.status(400).json({ error: 'No clock-in record found for today' });
        }

        if (row.break_in_time) {
            return res.status(400).json({ error: 'Break has already started' });
        }

        const updateQuery = `
            UPDATE attendance SET break_in_time = datetime('now', 'localtime') WHERE id = ?
        `;
        db.run(updateQuery, [row.id], function (err) {
            if (err) return handleError(res, err);

            res.json({ message: 'Break-in time recorded' });
        });
    });
});

// Break-Out
router.put('/attendance/break-out', (req, res) => {
    const { employee_id } = req.body;
    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    const checkQuery = `
        SELECT id, break_in_time, break_out_time 
        FROM attendance 
        WHERE employee_id = ? 
        AND date(clock_in_time) = date('now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) return handleError(res, err);

        if (!row || !row.break_in_time) {
            return res.status(400).json({ error: 'Cannot break out without starting a break' });
        }

        if (row.break_out_time) {
            return res.status(400).json({ error: 'Break has already ended' });
        }

        const updateQuery = `
            UPDATE attendance SET break_out_time = datetime('now', 'localtime') WHERE id = ?
        `;
        db.run(updateQuery, [row.id], function (err) {
            if (err) return handleError(res, err);

            res.json({ message: 'Break-out time recorded' });
        });
    });
});

// Clock-Out
router.put('/attendance/clock-out', (req, res) => {
    const { employee_id } = req.body;
    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    const checkQuery = `
        SELECT id, clock_out_time 
        FROM attendance 
        WHERE employee_id = ? 
        AND date(clock_in_time) = date('now', 'localtime')
    `;

    db.get(checkQuery, [employee_id], (err, row) => {
        if (err) return handleError(res, err);

        if (!row) {
            return res.status(400).json({ error: 'No clock-in record found for today' });
        }

        if (row.clock_out_time) {
            return res.status(400).json({ error: 'Already clocked out today' });
        }

        const updateQuery = `
            UPDATE attendance SET clock_out_time = datetime('now', 'localtime') WHERE id = ?
        `;
        db.run(updateQuery, [row.id], function (err) {
            if (err) return handleError(res, err);

            res.json({ message: 'Clock-out time recorded' });
        });
    });
});

// Fetch Attendance Records
router.get('/attendance', (req, res) => {
    const query = `
        SELECT 
            a.id, a.employee_id, a.clock_in_time, a.break_in_time, a.break_out_time, a.clock_out_time
        FROM 
            attendance a
        JOIN 
            employees e ON a.employee_id = e.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return handleError(res, err);

        res.json(rows);
    });
});

// Fetch Today's Attendance for an Employee
router.get('/attendance/today', (req, res) => {
    const { employee_id } = req.query;
    if (!employee_id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    const query = `
        SELECT 
            a.id, e.name, a.clock_in_time, a.break_in_time, a.break_out_time, a.clock_out_time
        FROM 
            attendance a
        JOIN 
            employees e ON a.employee_id = e.id
        WHERE 
            a.employee_id = ?
        AND date(a.clock_in_time) = date('now', 'localtime')
    `;
    db.all(query, [employee_id], (err, rows) => {
        if (err) return handleError(res, err);

        res.json(rows);
    });
});

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

module.exports = router;