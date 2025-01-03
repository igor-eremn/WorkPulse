import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cron from 'node-cron';
import fetch from 'node-fetch';
import client from './mongoClient.js';
import dotenv from 'dotenv';

dotenv.config();

import peopleRoutes from './routes/routes-emp.js';
import timeRoutes from './routes/routes-att.js';
import xclRoutes from './routes/routes-xclx.js';
import maintenanceRoutes from './routes/routes-maint.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/', peopleRoutes);
app.use('/', timeRoutes);
app.use('/', xclRoutes);
app.use('/', maintenanceRoutes);

// MongoDB Connection
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
}
connectToDatabase();

// Schedule Maintenance
cron.schedule('30 23 * * *', async () => {
    try {
        console.log("🚀 ~ SERVER MESSAGE ~ Running scheduled maintenance...");
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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});