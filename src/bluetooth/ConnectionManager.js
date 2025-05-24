const { DeviceState, DeviceTypes } = require('./DeviceManager');

class ConnectionManager {
    constructor() {
        this.activeConnections = new Map();
    }

    async connect(device) {
        device.updateState(DeviceState.CONNECTING);
        device.connectionAttempts++;

        try {
            // Get device configuration
            const config = DeviceTypes[device.type];
            if (!config) {
                throw new Error(`Unknown device type: ${device.type}`);
            }

            // Ensure device is disconnected first
            if (await device.isConnected()) {
                await device.disconnect();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Connect to device
            await device.connect();
            device.updateState(DeviceState.HANDSHAKING);

            // Get GATT server
            const gattServer = await device.gatt();

            // Find our service
            let service;
            for (const uuid of config.services) {
                try {
                    service = await gattServer.getPrimaryService(uuid);
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (!service) {
                throw new Error('Required service not found');
            }

            // Find our characteristic
            let characteristic;
            for (const uuid of config.characteristics) {
                try {
                    characteristic = await service.getCharacteristic(uuid);
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (!characteristic) {
                throw new Error('Required characteristic not found');
            }

            // Verify notifications are supported
            const flags = await characteristic.flags();
            if (!flags.includes('notify')) {
                throw new Error('Notifications not supported');
            }

            // Store characteristic in device
            device.characteristic = characteristic;

            // Set up notifications
            await characteristic.startNotifications();

            // Set up value change handler
            characteristic.on('valuechanged', (buffer) => {
                device.addData(buffer);
            });

            // Start keep-alive mechanism
            device.startKeepAlive();

            // Update state
            device.updateState(DeviceState.CONNECTED);
            this.activeConnections.set(device.address, device);

            return true;

        } catch (error) {
            device.addError(error);
            throw error;
        }
    }

    async disconnect(device) {
        try {
            if (device.characteristic) {
                await device.characteristic.stopNotifications();
            }
            await device.disconnect();
            device.stopKeepAlive();
            this.activeConnections.delete(device.address);
            device.updateState(DeviceState.DISCONNECTED);
        } catch (error) {
            device.addError(error);
            throw error;
        }
    }

    async disconnectAll() {
        const promises = Array.from(this.activeConnections.values()).map(
            device => this.disconnect(device)
        );
        await Promise.allSettled(promises);
    }

    getActiveConnections() {
        return Array.from(this.activeConnections.values());
    }

    cleanup() {
        this.disconnectAll();
        this.activeConnections.clear();
    }
}

module.exports = ConnectionManager; 