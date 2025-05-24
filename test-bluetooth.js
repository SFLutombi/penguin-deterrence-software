const { createBluetooth } = require('node-ble');

async function testBluetoothConnection() {
    console.log('Starting Bluetooth test...');
    
    try {
        // Initialize Bluetooth
        console.log('Initializing Bluetooth...');
        const { bluetooth, destroy } = createBluetooth();

        // Get adapter
        console.log('Getting Bluetooth adapter...');
        const adapter = await bluetooth.defaultAdapter();
        if (!adapter) {
            throw new Error('No Bluetooth adapter found');
        }

        // Check adapter state
        console.log('Checking adapter state...');
        const powered = await adapter.isPowered();
        console.log('Adapter powered:', powered);

        if (!powered) {
            console.log('Powering on adapter...');
            await adapter.setPowered(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Start discovery
        console.log('Starting device discovery...');
        if (!await adapter.isDiscovering()) {
            await adapter.startDiscovery();
        }

        // Look for devices
        console.log('Scanning for devices...');
        let penguinDetector = null;
        let scanAttempts = 0;
        const maxScanAttempts = 5;

        while (scanAttempts < maxScanAttempts && !penguinDetector) {
            console.log(`Scan attempt ${scanAttempts + 1}/${maxScanAttempts}`);
            const devices = await adapter.devices();
            
            for (const address of devices) {
                try {
                    const device = await adapter.getDevice(address);
                    const deviceName = await device.getName();
                    console.log(`Found device: ${deviceName} (${address})`);
                    
                    if (deviceName === 'PenguinDetector') {
                        penguinDetector = device;
                        console.log('Found PenguinDetector device!');
                        break;
                    }
                } catch (error) {
                    // Skip devices that can't be accessed
                    continue;
                }
            }
            
            if (!penguinDetector) {
                console.log('PenguinDetector not found, waiting before next scan...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            scanAttempts++;
        }

        if (!penguinDetector) {
            throw new Error('PenguinDetector device not found after maximum scan attempts');
        }

        // Try to connect
        console.log('Attempting to connect to PenguinDetector...');
        await penguinDetector.connect();
        console.log('Successfully connected!');

        // Get GATT server
        console.log('Getting GATT server...');
        const gattServer = await penguinDetector.gatt();

        // List available services
        console.log('Discovering services...');
        const services = await gattServer.services();
        console.log('Available services:', services);

        // Try to find our service
        let service;
        for (const uuid of ['180f', '4fafc201-1fb5-459e-8fcc-c5c9c331914b']) {
            try {
                service = await gattServer.getPrimaryService(uuid);
                console.log('Found service with UUID:', uuid);
                break;
            } catch (e) {
                console.log(`Service ${uuid} not found, trying next...`);
            }
        }

        if (!service) {
            throw new Error('Required service not found');
        }

        // List characteristics
        console.log('Discovering characteristics...');
        const characteristics = await service.characteristics();
        console.log('Available characteristics:', characteristics);

        // Try to find our characteristic
        let characteristic;
        for (const uuid of ['2a19', 'beb5483e-36e1-4688-b7f5-ea07361b26a8']) {
            try {
                characteristic = await service.getCharacteristic(uuid);
                console.log('Found characteristic with UUID:', uuid);
                break;
            } catch (e) {
                console.log(`Characteristic ${uuid} not found, trying next...`);
            }
        }

        if (!characteristic) {
            throw new Error('Required characteristic not found');
        }

        // Check if notifications are supported
        const flags = await characteristic.flags();
        console.log('Characteristic flags:', flags);

        if (!flags.includes('notify')) {
            throw new Error('Notifications not supported');
        }

        // Subscribe to notifications
        console.log('Starting notifications...');
        await characteristic.startNotifications();

        // Listen for data
        console.log('Listening for data...');
        characteristic.on('valuechanged', (buffer) => {
            console.log('Received data:', buffer.toString());
        });

        // Keep the script running
        console.log('Test successful! Listening for data...');
        console.log('Press Ctrl+C to exit');

        // Handle cleanup on exit
        process.on('SIGINT', async () => {
            console.log('\nCleaning up...');
            try {
                await characteristic.stopNotifications();
                await penguinDetector.disconnect();
                await adapter.stopDiscovery();
                destroy();
                console.log('Cleanup successful');
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
            process.exit();
        });

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testBluetoothConnection().catch(console.error); 