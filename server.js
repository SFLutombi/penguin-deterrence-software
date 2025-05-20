const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');

const app = express();
const port = 3001; // Different from your Next.js port

// Enable CORS
app.use(cors());
app.use(express.json());

// Store the latest microphone data
let latestData = {
  amplitude: 0,
  frequency: 0,
  timestamp: 0
};

// Configure serial port
const serialPort = new SerialPort({
  path: 'COM3', // Change this to match your ESP32's port
  baudRate: 115200,
  autoOpen: false
});

// Create parser
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Handle serial data
parser.on('data', (data) => {
  try {
    const parsedData = JSON.parse(data);
    latestData = {
      amplitude: parsedData.amplitude,
      frequency: parsedData.frequency,
      timestamp: parsedData.timestamp
    };
    console.log('Received data:', latestData);
  } catch (error) {
    console.error('Error parsing data:', error);
  }
});

// Handle serial port errors
serialPort.on('error', (err) => {
  console.error('Serial port error:', err);
});

// API endpoint to get latest data
app.get('/api/microphone', (req, res) => {
  res.json(latestData);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  
  // Open serial port
  serialPort.open((err) => {
    if (err) {
      console.error('Error opening port:', err);
    } else {
      console.log('Serial port opened successfully');
    }
  });
}); 