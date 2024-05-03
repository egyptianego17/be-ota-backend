/**
 * Inserts data into the SQLite database.
 * @param {sqlite3.Database} db - The database connection.
 * @param {number} temperature - The temperature value.
 * @param {number} humidity - The humidity value.
 * @param {number} fanState - The fan state value.
 * @param {number} heaterState - The heater state value.
 * @param {string} deviceID - The device ID.
 * @param {string} firmwareVersion - The firmware version.
 */
export function insertData(db, temperature, humidity, fanState, heaterState, deviceID, firmwareVersion) {
    const stmt = db.prepare(`
        INSERT INTO SensorData (temperature, humidity, fanState, heaterState, deviceID, firmwareVersion)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(temperature, humidity, fanState, heaterState, deviceID, firmwareVersion, (err) => {
        if (err) {
            console.error('Failed to insert data:', err.message);
        } else {
            // console.log('Data inserted successfully');
        }
    });
    stmt.finalize();
}

/**
 * Fetches the last record from the SQLite database.
 * @param {sqlite3.Database} db - The database connection.
 * @param {function} callback - The callback function to handle the result.
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
 * Checks the device status based on the last reading in the database.
 * @param {sqlite3.Database} db - The database connection.
 * @param {function} callback - The callback function to handle the result.
 */
export function checkDeviceStatus(db, callback) {
    // Define a query to get the most recent record
    const query = `
        SELECT *, strftime('%s', 'now') - strftime('%s', timestamp) as time_difference
        FROM SensorData
        ORDER BY id DESC
        LIMIT 1;
    `;
    
    // Execute the query
    db.get(query, (err, row) => {
        if (err) {
            console.error('Failed to execute query:', err.message);
            callback(null, err);
        } else {
            // Calculate the time difference in seconds
            const timeDifference = row ? row.time_difference : null;

            // Check if the time difference is within 30 seconds
            if (timeDifference !== null && timeDifference <= 30) {
                callback({ status: 'Online', lastSeen: row.timestamp }, null);
            } else {
                callback({ status: 'Offline', lastSeen: row ? row.timestamp : 'N/A' }, null);
            }
        }
    });
}

/**
 * Inserts a serial message into the database.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} serialMessage - The serial message to be inserted.
 */
export function insertSerialMessage(db, serialMessage) {
    // Prepare an SQL statement to insert the serial message
    const stmt = db.prepare(`
        INSERT INTO SerialMessages (message)
        VALUES (?)
    `);

    // Run the statement with the serial message as the argument
    stmt.run(serialMessage, (err) => {
        if (err) {
            console.error('Failed to insert serial message:', err.message);
        } else {
            // console.log('Serial message inserted successfully');
        }
    });

    // Finalize the statement to release resources
    stmt.finalize();
}


/**
 * Fetches the latest 10 serial messages from the SQLite database.
 * @param {sqlite3.Database} db - The database connection.
 * @param {function} callback - The callback function to handle the result.
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
