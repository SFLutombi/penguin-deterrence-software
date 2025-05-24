const EventEmitter = require('events');
const { createBluetooth } = require('node-ble');
const DeviceManager = require('./DeviceManager').DeviceManager;
const ConnectionManager = require('./ConnectionManager');
const DataManager = require('./DataManager');

class BluetoothSystem extends EventEmitter {
    constructor(options = {}) {
        super();
        // Increase max listeners to prevent warnings
        this.setMaxListeners(20);
        process.setMaxListeners(20);

        this.options = {
            maxConcurrentConnections: options.maxConcurrentConnections || 10,
            scanInterval: options.scanInterval || 5000,
            maxBufferSize: options.maxBufferSize || 1000,
            processingInterval: options.processingInterval || 100,
            ...options
        };
        
        this.isInitialized = false;
        this.deviceManager = null;
        this.connectionManager = null;
        this.dataManager = null;
        this.bluetooth = null;
        this.adapter = null;
        this.destroy = null;

        // Store cleanup handler
        this._cleanupHandler = this._handleCleanup.bind(this);
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Clean up any existing connections first
            await this._cleanupExistingConnections();

            // Initialize Bluetooth with a single connection
            const { bluetooth, destroy } = createBluetooth();
            this.bluetooth = bluetooth;
            this.destroy = destroy;

            // Get adapter
            this.adapter = await bluetooth.defaultAdapter();
            if (!this.adapter) {
                throw new Error('No Bluetooth adapter found');
            }

            // Ensure adapter is powered on
            if (!await this.adapter.isPowered()) {
                await this.adapter.setPowered(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Initialize managers
            this.deviceManager = new DeviceManager(
                this.adapter,
                this.options.maxConcurrentConnections
            );
            
            this.connectionManager = new ConnectionManager();
            
            this.dataManager = new DataManager({
                maxBufferSize: this.options.maxBufferSize,
                processingInterval: this.options.processingInterval
            });

            // Set up event handlers
            this.setupEventHandlers();

            // Start the system
            await this.start();

            this.isInitialized = true;
            this.emit('initialized');

        } catch (error) {
            await this.cleanup();
            throw error;
        }
    }

    async _cleanupExistingConnections() {
        try {
            // Use system command to clean up existing connections
            const { exec } = require('child_process');
            await new Promise((resolve, reject) => {
                exec('pkill -f "bluetoothd|bluetooth"', (error) => {
                    // Ignore errors as the process might not exist
                    resolve();
                });
            });
            // Wait for bluetooth service to restart
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.warn('Failed to clean up existing connections:', error);
        }
    }

    setupEventHandlers() {
        // Remove any existing handlers
        this.removeAllListeners();
        process.removeListener('SIGINT', this._cleanupHandler);
        process.removeListener('SIGTERM', this._cleanupHandler);

        // Device Manager events
        this.deviceManager?.on('deviceDiscovered', (device) => {
            this.emit('deviceDiscovered', device);
        });

        this.deviceManager?.on('deviceStateChange', ({ device, oldState, newState }) => {
            this.emit('deviceStateChange', { device, oldState, newState });
        });

        this.deviceManager?.on('deviceError', ({ device, error }) => {
            this.emit('deviceError', { device, error });
        });

        // Data Manager events
        this.dataManager?.on('dataReceived', ({ deviceAddress, data }) => {
            this.emit('dataReceived', { deviceAddress, data });
        });

        this.dataManager?.on('dataProcessed', ({ deviceAddress, data }) => {
            this.emit('dataProcessed', { deviceAddress, data });
        });

        this.dataManager?.on('processingError', ({ deviceAddress, error, data }) => {
            this.emit('processingError', { deviceAddress, error, data });
        });

        // Handle process termination
        process.on('SIGINT', this._cleanupHandler);
        process.on('SIGTERM', this._cleanupHandler);
    }

    async _handleCleanup() {
        console.log('Received termination signal. Cleaning up...');
        await this.cleanup();
        process.exit(0);
    }

    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Start device discovery
        await this.deviceManager?.startDiscovery();

        // Start data processing
        this.dataManager?.startProcessing();

        this.emit('started');
    }

    async stop() {
        this.deviceManager?.stopDiscovery();
        this.dataManager?.stopProcessing();
        await this.connectionManager?.disconnectAll();
        this.emit('stopped');
    }

    async cleanup() {
        if (!this.isInitialized) return;

        console.log('Cleaning up Bluetooth system...');
        
        try {
            await this.stop();
            
            this.deviceManager?.cleanup();
            this.connectionManager?.cleanup();
            this.dataManager?.cleanup();
            
            if (this.adapter) {
                try {
                    await this.adapter.stopDiscovery();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }

            // Clean up event listeners
            this.removeAllListeners();
            process.removeListener('SIGINT', this._cleanupHandler);
            process.removeListener('SIGTERM', this._cleanupHandler);

            if (this.destroy) {
                this.destroy();
                this.destroy = null;
            }

            this.deviceManager = null;
            this.connectionManager = null;
            this.dataManager = null;
            this.bluetooth = null;
            this.adapter = null;
            this.isInitialized = false;

            this.emit('cleanup');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    getSystemStatus() {
        if (!this.isInitialized) {
            return { status: 'not_initialized' };
        }

        return {
            status: 'running',
            devices: this.deviceManager.getDeviceStats(),
            activeConnections: this.connectionManager.getActiveConnections().length,
            adapterPowered: this.adapter?.isPowered(),
            isDiscovering: this.adapter?.isDiscovering()
        };
    }

    getDeviceData(deviceAddress, options = {}) {
        return this.dataManager.getDeviceData(deviceAddress, options);
    }

    getAllDevices() {
        return this.deviceManager?.devices || new Map();
    }

    getActiveConnections() {
        return this.connectionManager?.getActiveConnections() || [];
    }
}

module.exports = BluetoothSystem; 