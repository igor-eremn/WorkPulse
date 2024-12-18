const ExcelJS = require('exceljs');
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Generate and download Excel file with users' total hours worked
router.get('/employees/user/total/download', async (req, res) => {
    const query = `
        SELECT 
            e.id,
            e.name,
            IFNULL(
                ROUND(SUM(
                    CASE 
                        WHEN a.clock_out_time IS NOT NULL THEN 
                            (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time)) / 3600.0
                        ELSE 
                            (strftime('%s', 'now', 'localtime') - strftime('%s', a.clock_in_time)) / 3600.0
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

    db.all(query, [], async (err, rows) => {
        if (err) {
            console.error('Error fetching total hours worked:', err.message);
            return res.status(500).json({ error: err.message });
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Total Hours Worked');

            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Total Hours Worked', key: 'hours_worked', width: 20 },
            ];

            rows.forEach(row => worksheet.addRow(row));

            res.setHeader(
                'Content-Disposition',
                'attachment; filename="total_hours_worked.xlsx"'
            );
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            await workbook.xlsx.write(res);

            res.end();
        } catch (err) {
            console.error('Error generating Excel file:', err.message);
            res.status(500).json({ error: 'Failed to generate Excel file' });
        }
    });
});

// Generate and download Excel file with specific employee's attendance records in original way
router.get('/employees/user/:id/total/download/original_way', async (req, res) => {
    const employeeId = req.params.id;
    console.log("🚀 ~ router.get.report.id ~ employeeId:", employeeId);

    const query = `
        SELECT 
            e.name,
            a.clock_in_time,
            a.break_in_time,
            a.break_out_time,
            a.clock_out_time,
            ROUND(
                CASE 
                    WHEN a.clock_out_time IS NOT NULL THEN 
                        (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time)
                         - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                    ELSE 
                        (strftime('%s', 'now', 'localtime') - strftime('%s', a.clock_in_time)
                         - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                END, 2
            ) AS hours_worked
        FROM 
            employees e 
        LEFT JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            e.id = ?
        ORDER BY 
            a.clock_in_time ASC;
    `;

    db.all(query, [employeeId], async (err, rows) => {
        if (err) {
            console.error('Error fetching attendance records:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No attendance records found for this employee' });
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Attendance Records');

            // Add user name in the first row
            worksheet.addRow([`User: ${rows[0].name}`]);

            // Add headers
            worksheet.addRow(['Date', 'Clock In', 'Break In', 'Break Out', 'Clock Out', 'Hours Worked']);

            const formatDateAndTime = (timestamp) => {
                if (!timestamp) return { date: '', time: 'N/A' };
                const dateObj = new Date(timestamp);
                return {
                    date: dateObj.toISOString().split('T')[0], // Extract YYYY-MM-DD
                    time: dateObj.toTimeString().split(' ')[0] // Extract HH:MM:SS
                };
            };

            rows.forEach(row => {
                const clockIn = formatDateAndTime(row.clock_in_time);
                const breakIn = formatDateAndTime(row.break_in_time);
                const breakOut = formatDateAndTime(row.break_out_time);
                const clockOut = formatDateAndTime(row.clock_out_time);

                worksheet.addRow([
                    clockIn.date,           // Date column
                    clockIn.time,           // Clock In
                    breakIn.time,           // Break In
                    breakOut.time,          // Break Out
                    clockOut.time,          // Clock Out
                    row.hours_worked || 0   // Hours Worked
                ]);
            });

            const totalHours = rows.reduce((sum, row) => sum + (row.hours_worked || 0), 0);

            worksheet.addRow([]);
            worksheet.addRow(['Total Hours Worked', '', '', '', '', totalHours.toFixed(2)]);

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="attendance_${rows[0].name}.xlsx"`
            );
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            await workbook.xlsx.write(res);
            console.log("🚀 ~ router.get.report.id ~ Report is generated, sending to client....");
            res.end();
        } catch (err) {
            console.error('Error generating Excel file:', err.message);
            res.status(500).json({ error: 'Failed to generate Excel file' });
        }
    });
});

// Generate and download Excel file with specific employee's attendance records in decimal way
router.get('/employees/user/:id/total/download', async (req, res) => {
    const employeeId = req.params.id;
    console.log("🚀 ~ router.get.report.id ~ employeeId:", employeeId);

    const query = `
        SELECT 
            e.name,
            a.clock_in_time,
            a.break_in_time,
            a.break_out_time,
            a.clock_out_time,
            ROUND(
                CASE 
                    WHEN a.clock_out_time IS NOT NULL THEN 
                        (strftime('%s', a.clock_out_time) - strftime('%s', a.clock_in_time)
                         - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                    ELSE 
                        (strftime('%s', 'now', 'localtime') - strftime('%s', a.clock_in_time)
                         - (strftime('%s', a.break_out_time) - strftime('%s', a.break_in_time))) / 3600.0
                END, 2
            ) AS hours_worked
        FROM 
            employees e 
        LEFT JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            e.id = ?
        ORDER BY 
            a.clock_in_time ASC;
    `;

    db.all(query, [employeeId], async (err, rows) => {
        if (err) {
            console.error('Error fetching attendance records:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No attendance records found for this employee' });
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Attendance Records');

            worksheet.addRow([`User: ${rows[0].name}`]);
            worksheet.addRow(['Date', 'Clock In', 'Break In', 'Break Out', 'Clock Out', 'Hours Worked']);

            const formatDateAndDecimalTime = (timestamp) => {
                if (!timestamp) return { date: '', time: 'N/A' };

                const dateObj = new Date(timestamp);
                const hours = dateObj.getHours();
                const minutes = dateObj.getMinutes();
                const decimalTime = hours + Math.round((minutes / 60) * 10) / 10;

                return {
                    date: dateObj.toISOString().split('T')[0],
                    time: decimalTime.toFixed(1)
                };
            };

            rows.forEach(row => {
                const clockIn = formatDateAndDecimalTime(row.clock_in_time);
                const breakIn = formatDateAndDecimalTime(row.break_in_time);
                const breakOut = formatDateAndDecimalTime(row.break_out_time);
                const clockOut = formatDateAndDecimalTime(row.clock_out_time);
            
                worksheet.addRow([
                    clockIn.date,           // Date column
                    clockIn.time,           // Clock In (decimal format)
                    breakIn.time,           // Break In (decimal format)
                    breakOut.time,          // Break Out (decimal format)
                    clockOut.time,          // Clock Out (decimal format)
                    row.hours_worked || 0   // Hours Worked
                ]);
            });

            const totalHours = rows.reduce((sum, row) => sum + (row.hours_worked || 0), 0);

            worksheet.addRow([]);
            worksheet.addRow(['Total Hours Worked', '', '', '', '', totalHours.toFixed(2)]);

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="attendance_${rows[0].name}.xlsx"`
            );
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            await workbook.xlsx.write(res);
            console.log("🚀 ~ router.get.report.id ~ Report is generated, sending to client....");
            res.end();
        } catch (err) {
            console.error('Error generating Excel file:', err.message);
            res.status(500).json({ error: 'Failed to generate Excel file' });
        }
    });
});

module.exports = router;