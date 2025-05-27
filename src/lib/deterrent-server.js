const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 8080;

// Keep track of connected deterrent devices
const deterrentDevices = new Set();

wss.on('connection', (ws) => {
    console.log('New client connected to deterrent server');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received on deterrent server:', data);

            if (data.type === 'hello' && data.device === 'deterrent') {
                console.log('Deterrent device identified');
                deterrentDevices.add(ws);
                return;
            }

            // Forward commands to all deterrent devices
            if (data.command) {
                deterrentDevices.forEach((device) => {
                    if (device.readyState === WebSocket.OPEN) {
                        device.send(JSON.stringify(data));
                    }
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected from deterrent server');
        deterrentDevices.delete(ws);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Deterrent WebSocket server running on port ${port}`);
}); 