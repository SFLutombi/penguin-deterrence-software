const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Store the latest microphone data for each microphone
const microphoneData = {
  microphone1: {
    amplitude: 0,
    frequency: 0,
    timestamp: 0,
    port: 'COM1'
  },
  microphone2: {
    amplitude: 0,
    frequency: 0,
    timestamp: 0,
    port: 'COM2'
  },
  microphone3: {
    amplitude: 0,
    frequency: 0,
    timestamp: 0,
    port: 'COM3'
  }
};

// Configure serial ports for each microphone
const serialPorts = {
  microphone1: new SerialPort({
    path: 'COM1',
    baudRate: 115200,
    autoOpen: false
  }),
  microphone2: new SerialPort({
    path: 'COM2',
    baudRate: 115200,
    autoOpen: false
  }),
  microphone3: new SerialPort({
    path: 'COM3',
    baudRate: 115200,
    autoOpen: false
  })
};

// Create parsers for each port
const parsers = {};
Object.keys(serialPorts).forEach(mic => {
  parsers[mic] = serialPorts[mic].pipe(new ReadlineParser({ delimiter: '\r\n' }));
  
  // Handle serial data for each microphone
  parsers[mic].on('data', (data) => {
    try {
      console.log(`Raw data received from ${mic}:`, data);
      const parsedData = JSON.parse(data);
      microphoneData[mic] = {
        ...parsedData,
        port: microphoneData[mic].port
      };
      console.log(`Parsed data for ${mic}:`, microphoneData[mic]);
    } catch (error) {
      console.error(`Error parsing data from ${mic}:`, error);
      console.error('Raw data that caused error:', data);
    }
  });

  // Handle serial port errors
  serialPorts[mic].on('error', (err) => {
    console.error(`Serial port error for ${mic}:`, err);
  });
});

// API endpoint to get latest data for all microphones
app.get('/api/microphones', (req, res) => {
  console.log('API request received, sending data for all microphones');
  res.json(microphoneData);
});

// API endpoint to get latest data for a specific microphone
app.get('/api/microphones/:id', (req, res) => {
  const micId = req.params.id;
  if (microphoneData[micId]) {
    console.log(`API request received, sending data for ${micId}:`, microphoneData[micId]);
    res.json(microphoneData[micId]);
  } else {
    res.status(404).json({ error: 'Microphone not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  
  // Open all serial ports
  Object.keys(serialPorts).forEach(mic => {
    serialPorts[mic].open((err) => {
      if (err) {
        console.error(`Error opening port for ${mic}:`, err);
      } else {
        console.log(`Serial port opened successfully for ${mic}`);
      }
    });
  });
}); 