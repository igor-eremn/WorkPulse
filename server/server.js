import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cron from 'node-cron';
import fetch from 'node-fetch';

import peopleRoutes         from './routes/routes-emp.js';
import timeRoutes           from './routes/routes-att.js';
import xclRoutes            from './routes/routes-xclx.js';
import maintenanceRoutes    from './routes/routes-maint.js';

import { initializeDatabase } from './db/initialize.js';
initializeDatabase();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/', peopleRoutes);
app.use('/', timeRoutes);
app.use('/', xclRoutes);
app.use('/', maintenanceRoutes);

initializeDatabase();

cron.schedule('42 23 * * *', async () => {
    try {
        console.log("🚀 ~ SERVER MESSAGE ~ Running scheduled maintenance at 11:42 PM...");
        const response = await fetch('http://localhost:3000/attendance/maintain', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Failed to run maintenance: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Maintenance result:', result.message);
    } catch (err) {
        console.error('Error during scheduled maintenance:', err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});