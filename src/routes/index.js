import express from 'express';
import { fetchLastRecord } from '../database/queries.js';
import { checkDeviceStatus } from '../database/queries.js';
import { fetchLatestSerialMessages } from '../database/queries.js';

const router = express.Router();

/**
 * API endpoint to get the last record from the database.
 */
router.get('/get-sensor-data', (req, res) => {
    const db = req.app.locals.db;
    fetchLastRecord(db, (row, err) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (row) {
                res.json(row);
            } else {
                res.status(404).json({ error: 'No records found' });
            }
        }
    });
});

router.get('/check-device-status', (req, res) => {
    const db = req.app.locals.db;
    
    // Call the function to check device status
    checkDeviceStatus(db, (result, err) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});

router.get('/latest-serial-messages', (req, res) => {
    const db = req.app.locals.db;

    // Fetch the latest 10 serial messages
    fetchLatestSerialMessages(db, (messages, err) => {
        if (err) {
            // Handle the error by sending an error response
            res.status(500).json({ error: 'Failed to fetch latest serial messages' });
        } else {
            // Send the latest 10 messages as a JSON response
            res.json(messages);
        }
    });
});

/**
 * API endpoint for testing.
 */
router.get('/test', (req, res) => {
    res.send('Hello, this is a test endpoint!');
});

// Change the export statement to a named export
export const routes = router;
