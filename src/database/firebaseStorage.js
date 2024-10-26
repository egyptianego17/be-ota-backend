import firebaseAdmin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin SDK with your service account key
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    storageBucket: 'bee-encubator-ota-v1.appspot.com', // Replace with your Firebase storage bucket ID
});

/**
 * Uploads a file to Firebase Storage.
 *
 * @param {Object} file - The file object to be uploaded, typically from multer.
 * @param {string} firmwareVersion - The firmware version (e.g., '1.0.0') for organizing the file in Firebase Storage.
 * @returns {Promise<string>} - The destination path of the uploaded file in Firebase Storage.
 */
export async function uploadFileToFirebaseStorage(file, firmwareVersion) {
    // Get a reference to the Firebase storage bucket
    const bucket = firebaseAdmin.storage().bucket();
    
    // Define the path for the firmware file in the bucket
    const destinationPath = `firmware/${firmwareVersion}/firmware.bin`;
    
    // Check if the file with the same firmware version exists in the bucket
    const existingFiles = await bucket.getFiles({ prefix: `firmware/${firmwareVersion}/` });
    
    // If files with the same version exist, delete them
    if (existingFiles[0].length > 0) {
        for (const existingFile of existingFiles[0]) {
            await existingFile.delete();
            console.log(`Deleted existing file: ${existingFile.name}`);
        }
    }

    // Create a reference to the firmware.bin file in Firebase Storage
    const fileRef = bucket.file(destinationPath);
    
    // Upload the file with the buffer and MIME type
    await fileRef.save(file.buffer, {
        metadata: {
            contentType: file.mimetype,
        },
    });
    
    console.log(`File uploaded successfully to Firebase Storage: ${destinationPath}`);
    
    // Return the destination path for reference
    return destinationPath;
}

/**
 * Lists firmware versions available in the Firebase Storage bucket.
 *
 * @returns {Promise<string[]>} - An array of unique firmware versions found in the bucket.
 */
export async function listFirmwareVersions() {
    try {
        // Get a reference to the Firebase storage bucket
        const bucket = firebaseAdmin.storage().bucket();

        // List all files in the bucket
        const [files] = await bucket.getFiles();
        
        // Define a set to hold unique firmware versions
        const versions = new Set();
        
        // Iterate through the files and extract the version from the file path
        files.forEach(file => {
            const filePath = file.name;
            
            // Check if the file path matches the expected pattern (e.g., "firmware/1.0.0/firmware.bin")
            const regex = /^firmware\/([\d\.]+)\/firmware\.bin$/;
            const match = filePath.match(regex);
            
            if (match) {
                const version = match[1];
                
                // Add the version to the set of unique versions
                versions.add(version);
            }
        });
        
        // Convert the set to an array and return it
        return Array.from(versions);
    } catch (error) {
        console.error('Error listing firmware versions:', error);
        throw error;
    }
}
