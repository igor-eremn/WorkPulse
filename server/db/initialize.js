import db from './database.js';

export const initializeDatabase = () => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS employees (
                id TEXT PRIMARY KEY, -- Custom ID format (e.g., 1001)
                name TEXT NOT NULL,
                role INTEGER NOT NULL,
                password TEXT NOT NULL
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS attendance (
                id TEXT PRIMARY KEY, -- Custom ID format (e.g., 2001)
                employee_id TEXT NOT NULL, -- Links to employees.id
                clock_in_time DATETIME NOT NULL,
                break_in_time DATETIME,
                break_out_time DATETIME,
                clock_out_time DATETIME,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        `);

        console.log('Database initialized');
    });
};