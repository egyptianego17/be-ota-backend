import mqtt from 'mqtt';

/**
 * Initializes and connects the MQTT client with the specified options.
 */
export function initializeMQTTClient(options) {
    const client = mqtt.connect(options);

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
    });

    client.on('error', (err) => {
        console.error('MQTT client error:', err);
    });

    client.on('close', () => {
        console.log('MQTT client disconnected');
    });

    return client;
}

export default initializeMQTTClient;

/* 2 Fans */
/* 4 Heaters */