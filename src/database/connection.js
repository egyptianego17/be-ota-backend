import sqlite3 from 'sqlite3';
sqlite3.verbose();
/**
 * Initializes the SQLite database connection and sets up the schema.
 *
 * This function creates a connection to an SQLite database file named 'data.db'. 
 * If the connection is successful, it will proceed to create the necessary tables for 
 * the application if they do not already exist: `SensorData`, `SerialMessages`, and 
 * `LatestStableFirmware`.
 * 
 * For each table creation, if there is an error during the creation process, an error 
 * message is logged to the console. If the tables are successfully created or already 
 * exist, an informational message is logged to the console.
 * 
 * Tables created by this function:
 * 
 * - `SensorData`:
 *   - Fields:
 *     - `id`: Primary key, autoincremented integer.
 *     - `temperature`: Real number representing the temperature.
 *     - `humidity`: Real number representing the humidity.
 *     - `fanState`: Integer representing the state of the fan.
 *     - `heaterState`: Integer representing the state of the heater.
 *     - `deviceID`: Text identifier for the device.
 *     - `firmwareVersion`: Text representing the firmware version.
 *     - `timestamp`: DateTime value set to the current timestamp.
 * 
 * - `SerialMessages`:
 *   - Fields:
 *     - `id`: Primary key, autoincremented integer.
 *     - `message`: Text containing the message.
 * 
 * - `LatestStableFirmware`:
 *   - Fields:
 *     - `id`: Primary key, autoincremented integer.
 *     - `firmwareVersion`: Text representing the firmware version.
 *     - `timestamp`: DateTime value set to the current timestamp.
 * 
 * @returns {sqlite3.Database} The database connection object.
 */
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

            // Create the LatestStableFirmware table
            db.run(`
            CREATE TABLE IF NOT EXISTS LatestStableFirmware (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firmwareVersion TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP      
            )
            `, (err) => {
                if (err) {
                    console.error('Failed to create LatestStableFirmware table:', err.message);
                } else {
                    console.log('LatestStableFirmware table created successfully.');
                }
            });

            // Create the LatestStableFirmware table
            db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )
            `, (err) => {
                if (err) {
                    console.error('Failed to create Users table:', err.message);
                } else {
                    console.log('Users table created successfully.');
                }
            });

        }
    });

    return db;
}

// Export the function as a default export
export default initializeDatabase;
