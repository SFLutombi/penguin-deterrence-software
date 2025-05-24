const express = require('express');
const cors = require('cors');
const BluetoothSystem = require('./src/bluetooth/BluetoothSystem');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Store settings with default values
let settings = {
    microphone1: {
        id: 'microphone1',
        name: 'Microphone 1',
        location: 'North Perimeter',
        deviceId: '',
        thresholds: {
            amplitude: 300000,
            frequency: 400
        },
        sensitivity: 75
    },
    microphone2: {
        id: 'microphone2',
        name: 'Microphone 2',
        location: 'East Perimeter',
        deviceId: '',
        thresholds: {
            amplitude: 300000,
            frequency: 400
        },
        sensitivity: 75
    },
    microphone3: {
        id: 'microphone3',
        name: 'Microphone 3',
        location: 'South Perimeter',
        deviceId: '',
        thresholds: {
            amplitude: 300000,
            frequency: 400
        },
        sensitivity: 75
    }
};

// Store alerts
const alerts = [];

// Initialize Bluetooth system
const bluetoothSystem = new BluetoothSystem({
    maxConcurrentConnections: 3, // One for each microphone
    scanInterval: 5000,
    maxBufferSize: 1000,
    processingInterval: 100
});

// Set up Bluetooth system event handlers
bluetoothSystem.on('deviceDiscovered', (device) => {
    console.log(`Device discovered: ${device.address}`);
});

bluetoothSystem.on('deviceStateChange', ({ device, oldState, newState }) => {
    console.log(`Device ${device.address} state changed from ${oldState} to ${newState}`);
    
    // Find microphone ID for this device
    const micId = Object.keys(settings).find(
        key => settings[key].deviceId === device.address
    );
    
    if (micId) {
        // Update connection status in settings
        settings[micId].connected = newState === 'connected';
    }
});

bluetoothSystem.on('dataProcessed', ({ deviceAddress, data }) => {
    // Find microphone ID for this device
    const micId = Object.keys(settings).find(
        key => settings[key].deviceId === deviceAddress
    );
    
    if (micId && data.length > 0) {
        const lastReading = data[data.length - 1];
        
        // Check thresholds and generate alerts
        if (lastReading.penguinDetected || 
            lastReading.amplitude > settings[micId].thresholds.amplitude) {
            
            const alert = {
                type: lastReading.penguinDetected ? 'penguin' : 'amplitude',
                message: `${lastReading.penguinDetected ? 'Penguin' : 'High amplitude'} detected at ${settings[micId].name} (${settings[micId].location})`,
                value: lastReading.penguinDetected ? lastReading.frequency : lastReading.amplitude,
                threshold: lastReading.penguinDetected ? settings[micId].thresholds.frequency : settings[micId].thresholds.amplitude,
                timestamp: lastReading.timestamp
            };
            
            alerts.push(alert);
            if (alerts.length > 100) {
                alerts.shift();
            }
        }
    }
});

// API Routes
app.get('/api/microphones', (req, res) => {
    const devices = bluetoothSystem.getAllDevices();
    const status = {};
    
    for (const [micId, micSettings] of Object.entries(settings)) {
        const device = devices.get(micSettings.deviceId);
        status[micId] = {
            ...micSettings,
            connected: device?.state === 'connected' || false,
            lastUpdate: device ? bluetoothSystem.getDeviceData(device.address, { last: 1 })[0]?.timestamp : null
        };
    }
    
    res.json(status);
});

app.get('/api/microphones/:id', (req, res) => {
    const micId = req.params.id;
    const micSettings = settings[micId];
    
    if (!micSettings) {
        return res.status(404).json({ error: 'Microphone not found' });
    }
    
    const device = bluetoothSystem.getAllDevices().get(micSettings.deviceId);
    if (!device) {
        return res.json({
            ...micSettings,
            connected: false,
            lastUpdate: null
        });
    }
    
    const lastReading = bluetoothSystem.getDeviceData(device.address, { last: 1 })[0];
    
    res.json({
        ...micSettings,
        connected: device.state === 'connected',
        lastUpdate: lastReading?.timestamp,
        currentData: lastReading
    });
});

app.get('/api/settings', (req, res) => {
    res.json(settings);
});

app.post('/api/settings', (req, res) => {
    try {
        const newSettings = req.body.settings;
        if (!newSettings || typeof newSettings !== 'object') {
            throw new Error('Invalid settings format');
        }

        // Update settings
        Object.entries(newSettings).forEach(([micId, micSettings]) => {
            if (settings[micId]) {
                settings[micId] = {
                    ...settings[micId],
                    ...micSettings,
                    thresholds: {
                        ...settings[micId].thresholds,
                        ...(micSettings && micSettings.thresholds || {})
                    }
                };
            }
        });

        res.json({ success: true, settings });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/alerts', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json(alerts.slice(-limit));
});

app.get('/api/system/status', (req, res) => {
    res.json(bluetoothSystem.getSystemStatus());
});

// Start server and initialize Bluetooth system
app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    try {
        await bluetoothSystem.initialize();
        console.log('Bluetooth system initialized');
    } catch (error) {
        console.error('Failed to initialize Bluetooth system:', error);
    }
}); 