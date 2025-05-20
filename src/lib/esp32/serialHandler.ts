import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { EventEmitter } from 'events'

interface PortInfo {
  path: string
  manufacturer?: string
}

export class SerialHandler extends EventEmitter {
  private port: SerialPort | null = null
  private parser: ReadlineParser | null = null
  private isConnected: boolean = false

  constructor() {
    super()
    this.initializeSerial()
  }

  private async initializeSerial() {
    try {
      // List available ports
      const ports = await SerialPort.list()
      console.log('Available ports:', ports)

      // Find ESP32 port (you might need to adjust the criteria)
      const espPort = ports.find((port: PortInfo) => 
        port.manufacturer?.includes('Silicon Labs') || 
        port.manufacturer?.includes('FTDI')
      )

      if (!espPort) {
        console.error('No ESP32 port found')
        return
      }

      // Create serial port connection
      this.port = new SerialPort({
        path: espPort.path,
        baudRate: 115200,
        autoOpen: false
      })

      // Create parser
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

      // Handle data
      this.parser.on('data', (data: string) => {
        try {
          const parsedData = JSON.parse(data)
          // Emit the data to any listeners
          this.emit('data', parsedData)
        } catch (error) {
          console.error('Error parsing data:', error)
        }
      })

      // Handle errors
      this.port.on('error', (err: Error) => {
        console.error('Serial port error:', err)
        this.isConnected = false
      })

      // Open the port
      await new Promise<void>((resolve, reject) => {
        this.port?.open((err: Error | null) => {
          if (err) {
            console.error('Error opening port:', err)
            reject(err)
            return
          }
          this.isConnected = true
          console.log('Serial port opened successfully')
          resolve()
        })
      })
    } catch (error) {
      console.error('Error initializing serial:', error)
    }
  }

  public async sendCommand(command: string) {
    if (!this.port || !this.isConnected) {
      throw new Error('Serial port not connected')
    }

    return new Promise<void>((resolve, reject) => {
      this.port?.write(command + '\n', (err: Error | null) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  public isPortConnected(): boolean {
    return this.isConnected
  }

  public async close() {
    if (this.port) {
      await new Promise<void>((resolve) => {
        this.port?.close(() => {
          this.isConnected = false
          resolve()
        })
      })
    }
  }
} 