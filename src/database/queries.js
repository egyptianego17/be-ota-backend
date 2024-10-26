import sqlite3 from 'sqlite3';
sqlite3.verbose();

/**
 * Initializes the SQLite database connection and sets up the schema.
 * 
 * @returns {sqlite3.Database} The SQLite database connection.
 * 
 * This function creates a connection to an SQLite database file named 'data.db'.
 * If the connection is successful, it creates the necessary tables (`SensorData`,
 * `SerialMessages`, and `LatestStableFirmware`) for the application if they do not
 * already exist. Errors during table creation are logged to the console.
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

/**
 * Inserts data into the `SensorData` table in the SQLite database.
 * 
 * @param {sqlite3.Database} db - The SQLite database connection.
 * @param {number} temperature - The temperature value to be inserted.
 * @param {number} humidity - The humidity value to be inserted.
 * @param {number} fanState - The state of the fan (integer) to be inserted.
 * @param {number} heaterState - The state of the heater (integer) to be inserted.
 * @param {string} deviceID - The device ID to be inserted.
 * @param {string} firmwareVersion - The firmware version to be inserted.
 * 
 * This function prepares an SQL statement to insert the provided sensor data values
 * into the `SensorData` table. It finalizes the statement after execution to release 
 * resources. Errors during the insertion are logged to the console.
 */
export function insertData(db, temperature, humidity, fanState, heaterState, deviceID, firmwareVersion) {
    const stmt = db.prepare(`
        INSERT INTO SensorData (temperature, humidity, fanState, heaterState, deviceID, firmwareVersion)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(temperature, humidity, fanState, heaterState, deviceID, firmwareVersion, (err) => {
        if (err) {
            console.error('Failed to insert data:', err.message);
        }
    });
    stmt.finalize();
}

/**
 * Fetches the most recent record from the `SensorData` table in the SQLite database.
 * 
 * @param {sqlite3.Database} db - The SQLite database connection.
 * @param {function} callback - The callback function to handle the result.
 * 
 * This function executes a query to retrieve the latest record from the `SensorData` table
 * ordered by `id` in descending order. The function passes the result to the provided callback
 * function. Errors during the query execution are logged to the console.
 */
export function fetchLastRecord(db, callback) {
    const query = `
        SELECT *
        FROM SensorData
        ORDER BY id DESC
        LIMIT 1;
    `;
    db.get(query, (err, row) => {
        if (err) {
            console.error('Failed to execute query:', err.message);
            callback(null, err);
        } else {
            callback(row, null);
        }
    });
}

/**
 * Checks the device status based on the most recent record in the `SensorData` table.
 * 
 * @param {sqlite3.Database} db - The SQLite database connection.
 * @param {function} callback - The callback function to handle the result.
 * 
 * This function retrieves the most recent record from the `SensorData` table and calculates
 * the time difference between the current time and the record's timestamp. If the time difference
 * is within 30 seconds, the device is considered "Online," otherwise "Offline." The function calls
 * the provided callback function with an object containing the device status and last seen timestamp.
 */
export function checkDeviceStatus(db, callback) {
    const query = `
        SELECT *, strftime('%s', 'now') - strftime('%s', timestamp) as time_difference
        FROM SensorData
        ORDER BY id DESC
        LIMIT 1;
    `;
    
    db.get(query, (err, row) => {
        if (err) {
            console.error('Failed to execute query:', err.message);
            callback(null, err);
        } else {
            const timeDifference = row ? row.time_difference : null;

            if (timeDifference !== null && timeDifference <= 30) {
                callback({ status: 'Online', lastSeen: row.timestamp }, null);
            } else {
                callback({ status: 'Offline', lastSeen: row ? row.timestamp : 'N/A' }, null);
            }
        }
    });
}

/**
 * Inserts a serial message into the `SerialMessages` table in the SQLite database.
 * 
 * @param {sqlite3.Database} db - The SQLite database connection.
 * @param {string} serialMessage - The serial message to be inserted.
 * 
 * This function prepares an SQL statement to insert the provided serial message into the
 * `SerialMessages` table. It finalizes the statement after execution to release resources.
 * Any errors during the insertion are logged to the console.
 */
export function insertSerialMessage(db, serialMessage) {
    const stmt = db.prepare(`
        INSERT INTO SerialMessages (message)
        VALUES (?)
    `);

    stmt.run(serialMessage, (err) => {
        if (err) {
            console.error('Failed to insert serial message:', err.message);
        }
    });
    stmt.finalize();
}

/**
 * Fetches the latest 10 serial messages from the `SerialMessages` table in the SQLite database.
 * 
 * @param {sqlite3.Database} db - The SQLite database connection.
 * @param {function} callback - The callback function to handle the result.
 * 
 * This function executes a query to retrieve the most recent 10 messages from the `SerialMessages`
 * table ordered by `id` in descending order. The function passes the result to the provided callback
 * function. Errors during the query execution are logged to the console.
 */
export function fetchLatestSerialMessages(db, callback) {
    const query = `
        SELECT *
        FROM SerialMessages
        ORDER BY id DESC
        LIMIT 10;
    `;
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Failed to execute query:', err.message);
            callback(null, err);
        } else {
            callback(rows, null);
        }
    });
}

/**
 * Sets the latest stable firmware version in the `LatestStableFirmware` table.
 * 
 * @param {sqlite3.Database} db - The SQLite database connection.
 * @param {string} firmwareVersion - The firmware version to be set.
 * @param {function} callback - The callback function to handle the result.
 * 
 * This function validates the firmware version format before inserting it into the
 * `LatestStableFirmware` table. If the version is invalid, an error is passed to the
 * callback function. On successful insertion, a success message is logged to the console,
 * and the callback function is called with a success response.
 */
export function setLatestStableFirmwareVersion(db, firmwareVersion, callback) {
    // Validate firmware version format
    function validateFirmwareVersion(version) {
        const versionPattern = /^\d+\.\d+\.\d+$/; // Major.minor.patch format
        return versionPattern.test(version);
    }

    if (!validateFirmwareVersion(firmwareVersion)) {
        return callback({ error: 'Invalid firmware version format. Use major.minor.patch (e.g., 1.0.2)' }, null);
    }

    // Insert the latest stable firmware version into the LatestStableFirmware table
    const insertQuery = `
        INSERT INTO LatestStableFirmware (firmwareVersion, timestamp)
        VALUES (?, CURRENT_TIMESTAMP);
    `;

    db.run(insertQuery, [firmwareVersion], (err) => {
        if (err) {
            console.error('Failed to set latest stable firmware version:', err.message);
            callback({ error: 'Failed to set latest stable firmware version' }, null);
        } else {
            console.log('Latest stable firmware version set successfully');
            callback(null, { message: 'Latest stable firmware version set successfully' });
        }
    });
}

/**
 * Fetches the latest stable firmware version from the `LatestStableFirmware` table.
 * 
 * @param {sqlite3.Database} db - The SQLite database connection.
 * @param {function} callback - The callback function to handle the result.
 * 
 * This function executes a query to retrieve the most recent firmware version from the
 * `LatestStableFirmware` table ordered by `timestamp` in descending order, limiting the
 * result to one entry. The function passes the result to the provided callback function.
 * Errors during the query execution are logged to the console.
 */
export function fetchLatestStableFirmwareVersion(db, callback) {
    const query = `
        SELECT firmwareVersion
        FROM LatestStableFirmware
        ORDER BY timestamp DESC
        LIMIT 1;
    `;
    db.get(query, (err, row) => {
        if (err) {
            console.error('Failed to fetch latest stable firmware version:', err.message);
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
}

export function createUser (db, username, password, callback) {
    db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, password],
        function(err) {
            callback(err);
        }
    );
};

export function findUserByUsername (db ,username, callback) {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], function(err, row) {
        callback(err, row);
    });
};

// Export the initializeDatabase function as the default export
export default initializeDatabase;
