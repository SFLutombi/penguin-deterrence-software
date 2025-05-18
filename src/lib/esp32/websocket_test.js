const { io } = require('socket.io-client');

class ESP32Simulator {
  constructor(url = 'http://localhost:3000') {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.interval = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.url, {
        path: '/api/esp32',
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        this.isConnected = false;
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      });
    });
  }

  startSimulation(intervalMs = 100) {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to Socket.IO server');
    }

    this.interval = setInterval(() => {
      // Simulate frequency between 100Hz and 10000Hz
      const frequency = Math.random() * 9900 + 100;
      // Simulate magnitude between 100 and 1000
      const magnitude = Math.random() * 900 + 100;
      
      // Send FFT data
      const fftData = {
        frequency,
        magnitude
      };
      
      // Send amplitude data
      const amplitudeData = {
        type: 'amplitude',
        value: magnitude * 10 // Simulated amplitude based on magnitude
      };

      if (this.socket?.connected) {
        this.socket.emit('fftData', fftData);
        this.socket.emit('amplitudeData', amplitudeData);
      }
    }, intervalMs);
  }

  stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  disconnect() {
    this.stopSimulation();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

async function runTest() {
  const simulator = new ESP32Simulator();
  
  try {
    await simulator.connect();
    console.log('Starting simulation...');
    simulator.startSimulation();
    
    // Run for 10 seconds then stop
    setTimeout(() => {
      simulator.stopSimulation();
      simulator.disconnect();
      console.log('Test completed');
    }, 10000);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Only run if this file is being executed directly
if (require.main === module) {
  runTest();
}

module.exports = ESP32Simulator; 