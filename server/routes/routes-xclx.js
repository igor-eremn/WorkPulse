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

// Generate and download Excel file with specific employee's total hours worked
router.get('/employees/user/:id/total/download', async (req, res) => {
    const employeeId = req.params.id;
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
            e.role = 0 AND e.id = ?
        GROUP BY 
            e.id
        ORDER BY 
            e.name ASC;
    `;
    db.all(query, [employeeId], async (err, rows) => {
        if (err) {
            console.error('Error fetching total hours worked:', err.message);
            return res.status(500).json({ error: err.message });
        }

        try {
            // Initialize a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();    
            const worksheet = workbook.addWorksheet('Total Hours Worked');
            // Add headers to the worksheet
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Total Hours Worked', key: 'hours_worked', width: 20 },
            ];
            // Add rows to the worksheet
            rows.forEach(row => worksheet.addRow(row));
            // Set the response headers for file download
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="total_hours_worked.xlsx"'
            );
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            // Write workbook to response
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.error('Error generating Excel file:', err.message);
            res.status(500).json({ error: 'Failed to generate Excel file' });
        }
    });
});

module.exports = router;