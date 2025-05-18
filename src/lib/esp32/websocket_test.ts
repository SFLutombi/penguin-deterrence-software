import * as ws from 'ws';

interface FFTData {
  frequency: number;
  magnitude: number;
}

interface AmplitudeData {
  type: 'amplitude';
  value: number;
}

class ESP32Simulator {
  private ws: ws.WebSocket | null = null;
  private isConnected = false;
  private interval: NodeJS.Timeout | null = null;

  constructor(private url: string = 'ws://localhost:3000/api/esp32') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new ws.WebSocket(this.url);

      this.ws.on('open', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
        resolve();
      });

      this.ws.on('error', (error: Error) => {
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

  startSimulation(intervalMs: number = 100) {
    if (!this.isConnected || !this.ws) {
      throw new Error('Not connected to WebSocket server');
    }

    this.interval = setInterval(() => {
      // Simulate frequency between 100Hz and 10000Hz
      const frequency = Math.random() * 9900 + 100;
      // Simulate magnitude between 100 and 1000
      const magnitude = Math.random() * 900 + 100;
      
      // Send FFT data
      const fftData: FFTData = {
        frequency,
        magnitude
      };
      
      // Send amplitude data
      const amplitudeData: AmplitudeData = {
        type: 'amplitude',
        value: magnitude * 10 // Simulated amplitude based on magnitude
      };

      if (this.ws?.readyState === ws.WebSocket.OPEN) {
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

// Example usage:
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

export default ESP32Simulator; 