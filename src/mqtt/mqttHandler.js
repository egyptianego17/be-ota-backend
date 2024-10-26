import { insertData } from '../database/queries.js';
import { insertSerialMessage } from '../database/queries.js';

/**
 * Handles incoming MQTT messages.
 * @param {mqtt.Client} client - The MQTT client.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} topic - The MQTT topic to subscribe to.
 */
export function handleMQTTMessages(client, db, topic) {
    // Subscribe to the topic
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        } else {
            console.log('Subscribed to topic:', topic);
        }
    });

    // Listen for incoming messages
    client.on('message', (topic, message) => {
        try {
            const messageObject = JSON.parse(message.toString());
            if (messageObject.messageType === 'data') {
                const { temperature, humidity, heaterState, deviceID, version: firmwareVersion } = messageObject;

                // Log the data
                console.log('Data Message:');
                console.log('Temperature:', temperature);
                console.log('Humidity:', humidity);
                console.log('Heater State:', heaterState);
                console.log('Device ID:', deviceID);
                console.log('Firmware Version:', firmwareVersion);

                // Insert data into the database
                insertData(db, temperature, humidity, false, heaterState, deviceID, firmwareVersion);
            } else if (messageObject.messageType === 'serial') {
                // Handle other message types (optional)
                console.log('Serial Message:', messageObject.serialMessage);
                insertSerialMessage(db, messageObject.serialMessage);
            } else {
                console.log('Unknown message type:', messageObject.messageType);
            }
        } catch (err) {
            console.error('Failed to parse incoming message:', err.message);
        }
    });
}

export default handleMQTTMessages;
