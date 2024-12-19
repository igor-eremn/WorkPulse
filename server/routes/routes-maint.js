import express from 'express';
import db from '../db/database.js';
import moment from 'moment';

const router = express.Router();

router.post('/attendance/maintain', (req, res) => {
    console.log("🚀 ~ SERVER MESSAGE ~ Maintenance route accessed");
    const query = `
        SELECT id, clock_in_time
        FROM attendance
        WHERE clock_out_time IS NULL
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching open entries:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (rows.length === 0) {
            return res.json({ message: 'No open entries found' });
        }

        const updatePromises = rows.map(row => {
            const clockInDate = moment(row.clock_in_time).startOf('day');
            const isWeekend = clockInDate.isoWeekday() > 5;
            const defaultClockOutTime = isWeekend
                ? clockInDate.clone().hour(17).minute(0).second(0)
                : clockInDate.clone().hour(23).minute(20).second(0);

            const updateQuery = `
                UPDATE attendance
                SET clock_out_time = ?
                WHERE id = ?
            `;

            return new Promise((resolve, reject) => {
                db.run(updateQuery, [defaultClockOutTime.format('YYYY-MM-DD HH:mm:ss'), row.id], (err) => {
                    if (err) {
                        console.error(`Error updating entry ID ${row.id}:`, err.message);
                        return reject(err);
                    }
                    console.log(`Updated entry ID ${row.id} with clock_out_time: ${defaultClockOutTime.format('YYYY-MM-DD HH:mm:ss')}`);
                    resolve();
                });
            });
        });

        Promise.all(updatePromises)
            .then(() => res.json({ message: 'Maintenance completed. All open entries updated.' }))
            .catch(err => res.status(500).json({ error: 'Failed to update all open entries' }));
    });
});

export default router;