const WebSocket = require('ws');

class ESP32Simulator {
  constructor(url = 'ws://localhost:3001') {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
    this.interval = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('Disconnected from WebSocket server');
        this.isConnected = false;
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      });
    });
  }

  startSimulation(intervalMs = 100) {
    if (!this.isConnected || !this.ws) {
      throw new Error('Not connected to WebSocket server');
    }

    this.interval = setInterval(() => {
      // Simulate frequency between 100Hz and 10000Hz
      const frequency = Math.random() * 9900 + 100;
      // Simulate magnitude between 100 and 1000
      const magnitude = Math.random() * 900 + 100;
      
      // Send FFT data
      const fftData = {
        type: 'fft',
        frequency,
        magnitude,
        micId: 'm1'
      };
      
      // Send amplitude data
      const amplitudeData = {
        type: 'amplitude',
        value: magnitude * 10, // Simulated amplitude based on magnitude
        micId: 'm1'
      };

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(fftData));
        this.ws.send(JSON.stringify(amplitudeData));
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

async function runTest() {
  const simulator = new ESP32Simulator();
  
  try {
    await simulator.connect();
    console.log('Starting simulation...');
    simulator.startSimulation();
    
    // Run for 60 seconds then stop
    setTimeout(() => {
      simulator.stopSimulation();
      simulator.disconnect();
      console.log('Test completed');
      process.exit(0);
    }, 60000);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Only run if this file is being executed directly
if (require.main === module) {
  runTest();
}

module.exports = ESP32Simulator; 