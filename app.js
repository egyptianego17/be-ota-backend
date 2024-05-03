import express from 'express';
import cors from 'cors';
import databaseConnection from './src/database/connection.js';
import { routes } from './src/routes/index.js';
import { initializeMQTTClient } from './src/mqtt/mqttClient.js';
import { handleMQTTMessages } from './src/mqtt/mqttHandler.js';

// Initialize the Express app
const app = express();

// Use CORS middleware
app.use(cors());

// Initialize the SQLite database and store the connection in app locals
app.locals.db = databaseConnection();

// Use JSON middleware to parse JSON requests
app.use(express.json());

// Use the defined routes from the routes/index.js file
app.use('/', routes);

// Define MQTT options (broker URL, etc.)
const mqttOptions = {
    host: '0dc88b2a3f78492bb869b40cd2223080.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'xaviB',
    password: '12345678Aa',
};

// Initialize the MQTT client
const mqttClient = initializeMQTTClient(mqttOptions);

// Define the MQTT topic(s) you want to subscribe to
const mqttTopic = 'esp32'; // Replace with your desired MQTT topic

// Handle incoming MQTT messages on the specified topic(s)
handleMQTTMessages(mqttClient, app.locals.db, mqttTopic);

// Export the app for use in server.js
export default app;
