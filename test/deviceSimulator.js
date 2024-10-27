import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const client = mqtt.connect(`mqtts://${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
});

const DEVICE_ID = 'device123';
const VERSION = '1.0.0';

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    setInterval(() => {
        const temperature = (Math.random() * 30 + 15).toFixed(2);
        const humidity = (Math.random() * 50 + 30).toFixed(2);
        const heaterState = Math.random() < 0.5 ? 'ON' : 'OFF';
        const message = JSON.stringify({
            messageType: 'data',
            temperature,
            humidity,
            heaterState,
            deviceID: DEVICE_ID,
            version: VERSION,
        });
        client.publish('your/topic', message, { qos: 1 }, (err) => {
            if (err) {
                console.error('Publish error:', err);
            }
        });
    }, 5000);
});

client.on('error', (error) => {
    console.error('MQTT Client Error:', error);
});
