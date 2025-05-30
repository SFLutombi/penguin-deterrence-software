const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { addDetection } = require('../db');

const app = express();
const server = http.createServer(app);
const port = 3001;

// Enable CORS for the HTTP server
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Function to log detection to database
async function logDetection(data) {
    try {
        // Only log if a penguin is detected
        if (!data.penguinDetected) {
            return; // Skip logging if no penguin detected
        }

        // Only log FFT data which contains both frequency and magnitude
        if (data.type !== 'fft') {
            return; // Skip amplitude-only messages
        }

        const detection = {
            microphoneId: data.micId || 'unknown',
            frequency: data.frequency,
            magnitude: data.magnitude,
            type: 'frequency' // Always mark as frequency type since it's a penguin detection
        };
        
        console.log('Adding penguin detection to database:', detection);
        
        // Add to database
        const id = await addDetection(detection);
        console.log(`Successfully logged penguin detection with ID: ${id}`);
    } catch (error) {
        console.error('Error logging detection:', error.message);
        console.error('Stack:', error.stack);
    }
}

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    console.log('Client connected from:', req.socket.remoteAddress);

    // Handle incoming messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);

            // Log the detection to the database
            await logDetection(data);

            // Broadcast to all connected clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (e) {
            console.error('Error processing message:', e);
            console.log('Raw message:', message.toString());
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server' }));
});

// Start server
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
    console.log('WebSocket server is ready for connections');
}); 