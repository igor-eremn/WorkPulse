import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cron from 'node-cron';
import fetch from 'node-fetch';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
}
connectToDatabase();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

import peopleRoutes from './routes/routes-emp.js';
import timeRoutes from './routes/routes-att.js';
import xclRoutes from './routes/routes-xclx.js';
import maintenanceRoutes from './routes/routes-maint.js';

app.use('/', peopleRoutes);
app.use('/', timeRoutes);
app.use('/', xclRoutes);
app.use('/', maintenanceRoutes);

/* TEST FOR DB */
app.get('/test-connection', async (req, res) => {
    try {
        const db = client.db('DB1');
        const collection = db.collection('test_collection');
        const testDocument = await collection.insertOne({ message: 'Connection successful' });
        res.status(200).json({
            success: true,
            document: testDocument,
        });
    } catch (err) {
        console.error('❌ Error testing connection:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

cron.schedule('30 23 * * *', async () => {
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
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});