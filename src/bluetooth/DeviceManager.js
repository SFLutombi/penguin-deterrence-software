const EventEmitter = require('events');

// Device connection states
const DeviceState = {
    DISCONNECTED: 'disconnected',
    DISCOVERING: 'discovering',
    CONNECTING: 'connecting',
    HANDSHAKING: 'handshaking',
    CONNECTED: 'connected',
    ERROR: 'error'
};

// Device types and their configurations
const DeviceTypes = {
    PENGUIN_DETECTOR: {
        name: 'PenguinDetector',
        services: ['180f', '4fafc201-1fb5-459e-8fcc-c5c9c331914b'],
        characteristics: ['2a19', 'beb5483e-36e1-4688-b7f5-ea07361b26a8'],
        maxReconnectAttempts: 5,
        reconnectDelay: 5000,
        keepAliveInterval: 2000,
        maxMissedKeepAlives: 3
    }
};

class Device extends EventEmitter {
    constructor(address, type, manager) {
        super();
        this.address = address;
        this.type = type;
        this.manager = manager;
        this.state = DeviceState.DISCONNECTED;
        this.lastSeen = Date.now();
        this.connectionAttempts = 0;
        this.errorHistory = [];
        this.stats = {
            bytesReceived: 0,
            packetsReceived: 0,
            errors: 0,
            disconnections: 0,
            lastDataReceived: null
        };
        this.dataBuffer = [];
        this.missedKeepAlives = 0;
        this.keepAliveInterval = null;
        this.characteristic = null;
    }

    updateState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.emit('stateChange', { device: this, oldState, newState });
    }

    addError(error) {
        this.errorHistory.push({
            timestamp: Date.now(),
            error: error.toString()
        });
        this.stats.errors++;
        if (this.errorHistory.length > 100) {
            this.errorHistory.shift();
        }
    }

    resetStats() {
        this.connectionAttempts = 0;
        this.missedKeepAlives = 0;
    }

    shouldAttemptReconnect() {
        return this.connectionAttempts < DeviceTypes[this.type].maxReconnectAttempts;
    }

    async startKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }

        this.keepAliveInterval = setInterval(async () => {
            try {
                if (!this.characteristic) throw new Error('No characteristic available');
                await this.characteristic.read();
                this.missedKeepAlives = 0;
            } catch (error) {
                this.missedKeepAlives++;
                this.addError(error);
                
                if (this.missedKeepAlives >= DeviceTypes[this.type].maxMissedKeepAlives) {
                    this.emit('keepAliveFailed');
                }
            }
        }, DeviceTypes[this.type].keepAliveInterval);
    }

    stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        }
    }

    addData(data) {
        this.stats.bytesReceived += data.length;
        this.stats.packetsReceived++;
        this.stats.lastDataReceived = Date.now();
        this.dataBuffer.push({
            timestamp: Date.now(),
            data: data
        });

        // Keep buffer size reasonable
        if (this.dataBuffer.length > 1000) {
            this.dataBuffer.shift();
        }

        this.emit('data', data);
    }

    getHealth() {
        const now = Date.now();
        const timeSinceLastData = now - (this.stats.lastDataReceived || now);
        
        return {
            status: this.state,
            connectionHealth: this.missedKeepAlives === 0 ? 'good' : 
                            this.missedKeepAlives < 2 ? 'warning' : 'critical',
            timeSinceLastData,
            errorRate: this.stats.errors / (this.stats.packetsReceived || 1),
            disconnectionRate: this.stats.disconnections / (this.uptime / 3600000) // per hour
        };
    }

    cleanup() {
        this.stopKeepAlive();
        this.removeAllListeners();
    }
}

class DeviceManager extends EventEmitter {
    constructor(adapter, maxConcurrentConnections = 10) {
        super();
        this.adapter = adapter;
        this.maxConcurrentConnections = maxConcurrentConnections;
        this.devices = new Map();
        this.connectionQueue = [];
        this.blacklist = new Set();
        this.discoveryInterval = null;
    }

    async startDiscovery() {
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
        }

        const scan = async () => {
            try {
                const devices = await this.adapter.devices();
                
                for (const address of devices) {
                    if (this.blacklist.has(address)) continue;
                    
                    try {
                        const device = await this.adapter.getDevice(address);
                        const deviceName = await device.getName();
                        
                        // Check if it's a device type we care about
                        const deviceType = Object.keys(DeviceTypes).find(
                            type => DeviceTypes[type].name === deviceName
                        );

                        if (deviceType && !this.devices.has(address)) {
                            this.registerDevice(address, deviceType, device);
                        }
                    } catch (error) {
                        console.error(`Error handling device ${address}:`, error);
                    }
                }
            } catch (error) {
                console.error('Discovery error:', error);
            }
        };

        // Initial scan
        await scan();
        
        // Continue scanning periodically
        this.discoveryInterval = setInterval(scan, 5000);
    }

    stopDiscovery() {
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = null;
        }
    }

    registerDevice(address, type, bluetoothDevice) {
        const device = new Device(address, type, this);
        this.devices.set(address, device);
        
        device.on('stateChange', this.handleDeviceStateChange.bind(this));
        device.on('keepAliveFailed', () => this.handleDeviceDisconnection(device));
        
        this.emit('deviceDiscovered', device);
        this.attemptConnection(device);
    }

    async attemptConnection(device) {
        const activeConnections = Array.from(this.devices.values())
            .filter(d => d.state === DeviceState.CONNECTED).length;

        if (activeConnections >= this.maxConcurrentConnections) {
            this.queueConnection(device);
            return;
        }

        device.updateState(DeviceState.CONNECTING);
        this.emit('connecting', device);

        try {
            await this.connect(device);
        } catch (error) {
            device.addError(error);
            device.updateState(DeviceState.ERROR);
            this.handleDeviceError(device, error);
        }
    }

    queueConnection(device) {
        this.connectionQueue.push(device);
        device.updateState(DeviceState.QUEUED);
        this.emit('queued', device);
    }

    processQueue() {
        if (this.connectionQueue.length === 0) return;
        
        const device = this.connectionQueue.shift();
        this.attemptConnection(device);
    }

    async connect(device) {
        // Implementation will be in ConnectionManager.js
    }

    handleDeviceStateChange({ device, oldState, newState }) {
        this.emit('deviceStateChange', { device, oldState, newState });
        
        if (newState === DeviceState.CONNECTED) {
            device.resetStats();
        } else if (newState === DeviceState.DISCONNECTED) {
            this.processQueue();
        }
    }

    handleDeviceDisconnection(device) {
        device.updateState(DeviceState.DISCONNECTED);
        device.stats.disconnections++;
        
        if (device.shouldAttemptReconnect()) {
            this.attemptConnection(device);
        } else {
            this.blacklist.add(device.address);
            this.devices.delete(device.address);
            device.cleanup();
            this.emit('deviceBlacklisted', device);
        }
    }

    handleDeviceError(device, error) {
        this.emit('deviceError', { device, error });
        
        if (device.shouldAttemptReconnect()) {
            setTimeout(() => {
                this.attemptConnection(device);
            }, DeviceTypes[device.type].reconnectDelay * (device.connectionAttempts + 1));
        } else {
            this.handleDeviceDisconnection(device);
        }
    }

    getDeviceStats() {
        return {
            total: this.devices.size,
            connected: Array.from(this.devices.values())
                .filter(d => d.state === DeviceState.CONNECTED).length,
            queued: this.connectionQueue.length,
            blacklisted: this.blacklist.size,
            byState: Object.values(DeviceState).reduce((acc, state) => {
                acc[state] = Array.from(this.devices.values())
                    .filter(d => d.state === state).length;
                return acc;
            }, {})
        };
    }

    cleanup() {
        this.stopDiscovery();
        for (const device of this.devices.values()) {
            device.cleanup();
        }
        this.devices.clear();
        this.connectionQueue = [];
        this.removeAllListeners();
    }
}

module.exports = {
    DeviceManager,
    DeviceState,
    DeviceTypes
}; 