const { Server } = require('socket.io');
const fetch = require('node-fetch');

// Threshold configuration
const THRESHOLDS = {
  frequency: {
    min: 1000,    // Hz - typical penguin vocalizations
    max: 5000     // Hz
  },
  magnitude: 500,  // Threshold for significant sound detection
  amplitude: 5000  // Threshold for overall amplitude
};

let io = null;

// Function to check if the data indicates penguin activity
function isPenguinActivity(data) {
  if (data.frequency) {
    const isInRange = data.frequency >= THRESHOLDS.frequency.min && 
                     data.frequency <= THRESHOLDS.frequency.max;
    const isMagnitudeHigh = data.magnitude > THRESHOLDS.magnitude;
    
    console.log(`Checking FFT data:
      Frequency: ${data.frequency} Hz (${isInRange ? 'IN' : 'OUT OF'} RANGE)
      Magnitude: ${data.magnitude} (${isMagnitudeHigh ? 'ABOVE' : 'BELOW'} THRESHOLD)
    `);
    
    return isInRange && isMagnitudeHigh;
  }
  if (data.type === 'amplitude') {
    const isHighAmplitude = data.value > THRESHOLDS.amplitude;
    console.log(`Checking amplitude data:
      Value: ${data.value} (${isHighAmplitude ? 'ABOVE' : 'BELOW'} THRESHOLD)
    `);
    return isHighAmplitude;
  }
  return false;
}

// Function to log detection to the API
async function logDetection(data, wasTriggered = false) {
  try {
    const response = await fetch('http://localhost:3000/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        espId: 'ESP32-1',
        magnitude: data.magnitude || data.value,
        frequency: data.frequency || 0,
        timestamp: new Date().toISOString(),
        triggered: wasTriggered
      })
    });

    if (!response.ok) {
      console.error('Failed to log detection:', await response.text());
    } else {
      console.log(`Successfully logged ${wasTriggered ? 'ALERT' : 'debug'} detection to API`);
    }
  } catch (error) {
    console.error('Error logging detection:', error);
  }
}

// Function to trigger deterrent
async function triggerDeterrent() {
  try {
    const response = await fetch('http://localhost:3000/api/deter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode: 'both' })
    });

    if (!response.ok) {
      console.error('Failed to trigger deterrent:', await response.text());
    } else {
      console.log('Successfully triggered deterrent');
    }
  } catch (error) {
    console.error('Error triggering deterrent:', error);
  }
}

const initializeSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      path: '/api/esp32',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Handle FFT data
      socket.on('fftData', async (data) => {
        console.log('\n--- Processing FFT Data ---');
        
        // Log all detections for debugging
        await logDetection(data, false);
        
        // Check for penguin activity
        if (isPenguinActivity(data)) {
          console.log('⚠️ Potential penguin activity detected!');
          await logDetection(data, true);
          await triggerDeterrent();
        }

        // Broadcast to all connected clients
        io?.emit('fftData', data);
      });

      // Handle amplitude data
      socket.on('amplitudeData', async (data) => {
        console.log('\n--- Processing Amplitude Data ---');
        
        // Log all detections for debugging
        await logDetection(data, false);
        
        // Check for penguin activity based on amplitude
        if (isPenguinActivity(data)) {
          console.log('⚠️ High amplitude detected!');
          await logDetection(data, true);
          await triggerDeterrent();
        }

        // Broadcast to all connected clients
        io?.emit('amplitudeData', data);
      });
    });
  }
  return io;
};

const getSocketIO = () => io;

module.exports = {
  initializeSocket,
  getSocketIO
}; 