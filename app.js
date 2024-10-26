import express from 'express';
import cors from 'cors';
import databaseConnection from './src/database/connection.js';
import { routes } from './src/routes/index.js';
import { initializeMQTTClient } from './src/mqtt/mqttClient.js';
import { handleMQTTMessages } from './src/mqtt/mqttHandler.js';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

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

// Define MQTT options using environment variables
const mqttOptions = {
    host: process.env.MQTT_BROKER_URL,
    port: process.env.MQTT_BROKER_PORT || 8883,
    protocol: process.env.MQTT_BROKER_PROTOCOL || 'mqtts',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
};

// Initialize the MQTT client
const mqttClient = initializeMQTTClient(mqttOptions);
    
// Define the MQTT topic(s) you want to subscribe to
const mqttTopic = 'esp32'; // Replace with your desired MQTT topic

// Handle incoming MQTT messages on the specified topic(s)
handleMQTTMessages(mqttClient, app.locals.db, mqttTopic);

// Export the app for use in server.js
export default app;
