import express from 'express';
import multer from 'multer';
import path from 'path';
import authRoutes from './auth.js';
import verifyToken from '../middleware/auth.js';
import {
    fetchLastRecord,
    checkDeviceStatus,
    fetchLatestSerialMessages,
    setLatestStableFirmwareVersion,
    fetchLatestStableFirmwareVersion
} from '../database/queries.js';
import {
    uploadFileToFirebaseStorage,
    listFirmwareVersions
} from '../database/firebaseStorage.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// // Add authentication routes
// router.use('/auth', authRoutes);

// // Middleware to apply verifyToken to all routes below
// router.use(verifyToken);

/**
 * API endpoint to fetch the last record from the SensorData table.
 * 
 * @route GET /get-sensor-data
 * @returns JSON object with the last record or an error if something went wrong.
 */
router.get('/get-sensor-data', (req, res) => {
    const db = req.app.locals.db;
    fetchLastRecord(db, (row, err) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'No records found' });
        }
    });
});

/**
 * API endpoint to check the device status based on the most recent SensorData record.
 * 
 * @route GET /check-device-status
 * @returns JSON object with the device status and last seen timestamp or an error.
 */
router.get('/check-device-status', (req, res) => {
    const db = req.app.locals.db;
    checkDeviceStatus(db, (result, err) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});

/**
 * API endpoint to fetch the latest 10 serial messages from the SerialMessages table.
 * 
 * @route GET /latest-serial-messages
 * @returns JSON array with the latest 10 serial messages or an error.
 */
router.get('/latest-serial-messages', (req, res) => {
    const db = req.app.locals.db;
    fetchLatestSerialMessages(db, (messages, err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch latest serial messages' });
        } else {
            res.json(messages);
        }
    });
});

/**
 * Function to validate the format of the firmware version string.
 * 
 * @param {string} version - The firmware version string to validate.
 * @returns {boolean} True if the version format is valid, otherwise false.
 */
function validateFirmwareVersion(version) {
    const versionPattern = /^\d+\.\d+\.\d+$/; // Major.minor.patch format (e.g., 1.0.2)
    return versionPattern.test(version);
}

/**
 * API endpoint to handle firmware file uploads.
 * 
 * @route POST /firmware-update
 * @param {file} file - The uploaded firmware file (should be a .bin file).
 * @param {string} firmwareVersion - The firmware version string in major.minor.patch format (e.g., 1.0.2).
 * @returns JSON object with a success message or an error if the upload fails.
 */
router.post('/firmware-update', upload.single('firmwareFile'), async (req, res) => {
    try {
        const { file } = req;
        const { firmwareVersion } = req.body;

        console.log('Received file:', file);
        console.log('Received firmware version:', firmwareVersion);

        // Validate file type and firmware version
        if (!file || path.extname(file.originalname) !== '.bin') {
            return res.status(400).json({ error: 'Please upload a .bin file' });
        }
        if (!validateFirmwareVersion(firmwareVersion)) {
            return res.status(400).json({ error: 'Invalid firmware version format. Use major.minor.patch (e.g., 1.0.2)' });
        }

        // Upload the file to Firebase storage
        await uploadFileToFirebaseStorage(file, firmwareVersion);

        res.json({ message: 'Firmware uploaded and saved successfully' });
    } catch (error) {
        console.error('Error handling firmware upload:', error);
        res.status(500).json({ error: 'Failed to handle firmware upload' });
    }
});

/**
 * API endpoint to set the latest stable firmware version in the database.
 * 
 * @route GET /set-stable-latest-version
 * @param {string} firmwareVersion - The firmware version to set as the latest stable version.
 * @returns JSON object with a success message or an error.
 */
router.get('/set-stable-latest-version', (req, res) => {
    const db = req.app.locals.db;
    const firmwareVersion = req.query.firmwareVersion;

    console.log('Setting stable latest version:', firmwareVersion);

    // Validate firmware version format
    if (!firmwareVersion || !validateFirmwareVersion(firmwareVersion)) {
        return res.status(400).json({
            error: 'Invalid firmware version format. Use major.minor.patch (e.g., 1.0.2)',
        });
    }

    setLatestStableFirmwareVersion(db, firmwareVersion, (err, result) => {
        if (err) {
            console.error("Error setting stable latest version:", err);
            return res.status(500).json(err);
        } else {
            console.log("Stable latest version set successfully");
            return res.json(result);
        }
    });
});

/**
 * API endpoint to fetch the list of firmware versions from Firebase storage.
 * 
 * @route GET /firmware-versions
 * @returns JSON array with the list of firmware versions or an error.
 */
router.get('/firmware-versions', async (req, res) => {
    try {
        const versions = await listFirmwareVersions();
        res.json(versions);
    } catch (error) {
        console.error('Error fetching firmware versions:', error);
        res.status(500).json({ error: 'Failed to fetch firmware versions' });
    }
});

/**
 * API endpoint to fetch the latest stable firmware version.
 *
 * This endpoint retrieves the latest stable firmware version from the database
 * and returns it as a JSON response.
 */
router.get('/latest-stable-firmware', (req, res) => {
    // Get the database connection from the app's locals
    const db = req.app.locals.db;
    
    // Call the function to fetch the latest stable firmware version
    fetchLatestStableFirmwareVersion(db, (err, result) => {
        if (err) {
            console.error('Failed to fetch latest stable firmware version:', err.message);
            // Send a JSON response with a 500 status code if there's an error
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If the result is empty, there is no latest stable version available
            if (!result || !result.firmwareVersion) {
                res.status(404).json({ error: 'No stable firmware version found' });
            } else {
                // Return the latest stable firmware version as a JSON response
                res.json({ firmwareVersion: result.firmwareVersion });
            }
        }
    });
});

/**
 * API endpoint for testing the server.
 * 
 * @route GET /test
 * @returns A simple text response indicating that the server is running.
 */
router.get('/test', (req, res) => {
    res.send('Hello, this is a test endpoint!');
});

// Export the routes to be used in the main server file
export const routes = router;
