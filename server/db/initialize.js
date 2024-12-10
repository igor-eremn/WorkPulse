const db = require('./database');

const initializeDatabase = () => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                password TEXT NOT NULL
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
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

module.exports = initializeDatabase;