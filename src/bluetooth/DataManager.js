const EventEmitter = require('events');

class DataManager extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = {
            maxBufferSize: options.maxBufferSize || 1000,
            processingInterval: options.processingInterval || 100,
            maxBatchSize: options.maxBatchSize || 50
        };
        
        this.dataBuffers = new Map();
        this.processedData = new Map();
        this.processingInterval = null;
    }

    initializeDevice(deviceAddress) {
        if (!this.dataBuffers.has(deviceAddress)) {
            this.dataBuffers.set(deviceAddress, []);
            this.processedData.set(deviceAddress, []);
        }
    }

    addData(deviceAddress, data) {
        this.initializeDevice(deviceAddress);
        
        const buffer = this.dataBuffers.get(deviceAddress);
        buffer.push({
            timestamp: Date.now(),
            data: data,
            processed: false
        });

        // Keep buffer size under control
        if (buffer.length > this.options.maxBufferSize) {
            const overflow = buffer.length - this.options.maxBufferSize;
            buffer.splice(0, overflow);
        }

        this.emit('dataReceived', { deviceAddress, data });
    }

    startProcessing() {
        if (this.processingInterval) {
            return;
        }

        this.processingInterval = setInterval(() => {
            this.processBuffers();
        }, this.options.processingInterval);
    }

    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }

    processBuffers() {
        for (const [deviceAddress, buffer] of this.dataBuffers) {
            // Get unprocessed data
            const unprocessed = buffer.filter(item => !item.processed)
                                    .slice(0, this.options.maxBatchSize);
            
            if (unprocessed.length === 0) continue;

            try {
                // Process the data
                const processedBatch = this.processData(unprocessed);
                
                // Mark data as processed
                unprocessed.forEach(item => item.processed = true);
                
                // Store processed results
                const processedBuffer = this.processedData.get(deviceAddress);
                processedBuffer.push(...processedBatch);
                
                // Keep processed data buffer under control
                if (processedBuffer.length > this.options.maxBufferSize) {
                    const overflow = processedBuffer.length - this.options.maxBufferSize;
                    processedBuffer.splice(0, overflow);
                }

                // Emit processed data event
                this.emit('dataProcessed', {
                    deviceAddress,
                    data: processedBatch
                });
            } catch (error) {
                this.emit('processingError', {
                    deviceAddress,
                    error,
                    data: unprocessed
                });
            }
        }
    }

    processData(items) {
        return items.map(item => {
            const rawData = item.data.toString();
            
            try {
                // Parse the penguin detector data format
                const matches = rawData.match(/Amp Sum: ([\d.]+) \| Top Freq: ([\d.]+) Hz/);
                const penguinDetected = rawData.includes('PENGUIN');
                
                if (matches) {
                    const [_, amplitude, frequency] = matches;
                    return {
                        timestamp: item.timestamp,
                        amplitude: parseFloat(amplitude),
                        frequency: parseFloat(frequency),
                        penguinDetected,
                        raw: rawData
                    };
                }
                
                return {
                    timestamp: item.timestamp,
                    error: 'Invalid data format',
                    raw: rawData
                };
            } catch (error) {
                return {
                    timestamp: item.timestamp,
                    error: error.message,
                    raw: rawData
                };
            }
        });
    }

    getDeviceData(deviceAddress, options = {}) {
        const processedBuffer = this.processedData.get(deviceAddress) || [];
        
        if (options.timeRange) {
            const { start, end } = options.timeRange;
            return processedBuffer.filter(item => 
                item.timestamp >= start && item.timestamp <= end
            );
        }
        
        if (options.last) {
            return processedBuffer.slice(-options.last);
        }
        
        return processedBuffer;
    }

    clearDeviceData(deviceAddress) {
        this.dataBuffers.delete(deviceAddress);
        this.processedData.delete(deviceAddress);
    }

    cleanup() {
        this.stopProcessing();
        this.dataBuffers.clear();
        this.processedData.clear();
        this.removeAllListeners();
    }
}

module.exports = DataManager; 