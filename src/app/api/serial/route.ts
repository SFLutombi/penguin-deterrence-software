import { NextResponse } from 'next/server'
import { SerialHandler } from '@/lib/esp32/serialHandler'

let serialHandler: SerialHandler | null = null

export async function GET() {
  try {
    if (!serialHandler) {
      serialHandler = new SerialHandler()
    }

    return NextResponse.json({ 
      status: 'success', 
      connected: serialHandler.isPortConnected() 
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to initialize serial connection' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!serialHandler) {
      serialHandler = new SerialHandler()
    }

    const { command } = await request.json()
    
    if (!command) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'No command provided' 
      }, { status: 400 })
    }

    await serialHandler.sendCommand(command)
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Command sent successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to send command' 
    }, { status: 500 })
  }
} 