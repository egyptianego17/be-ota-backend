import sqlite3 from 'sqlite3';
sqlite3.verbose();

// Initializes the SQLite database connection and sets up the schema
function initializeDatabase() {
    const db = new sqlite3.Database('data.db', (err) => {
        if (err) {
            console.error('Failed to open database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');

            // Create the SensorData table if it doesn't already exist
            db.run(`
                CREATE TABLE IF NOT EXISTS SensorData (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    temperature REAL,
                    humidity REAL,
                    fanState INTEGER,
                    heaterState INTEGER,
                    deviceID TEXT,
                    firmwareVersion TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Failed to create SensorData table:', err.message);
                } else {
                    console.log('SensorData table created successfully or already exists.');
                }
            });

            // Create the SerialMessages table if it doesn't already exist
            db.run(`
                CREATE TABLE IF NOT EXISTS SerialMessages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    message TEXT NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Failed to create SerialMessages table:', err.message);
                } else {
                    console.log('SerialMessages table created successfully or already exists.');
                }
            });
        }
    });

    return db;
}

// Export the function as a default export
export default initializeDatabase;
