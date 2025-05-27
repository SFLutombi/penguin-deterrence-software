import { NextResponse } from 'next/server'
import WebSocket from 'ws'

const DETERRENT_WS_PORT = 8080
const DETERRENT_WS_HOST = 'localhost'

// In-memory queue for pending commands (replace with database in production)
let pendingCommands: Array<{
  mode: 'lights' | 'sound' | 'both' | 'stop'
  timestamp: string
}> = []

export async function POST(request: Request) {
  try {
    const { mode } = await request.json()
    
    // Map frontend modes to deterrent commands
    const commandMap = {
      'lights': 'lights_on',
      'sound': 'sound_on',
      'both': 'both_on',
      'stop': 'stop'
    }
    
    const command = commandMap[mode as keyof typeof commandMap]
    if (!command) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Create a WebSocket connection to send the command
    const ws = new WebSocket(`ws://${DETERRENT_WS_HOST}:${DETERRENT_WS_PORT}`)
    
    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        // For stop command, send both lights_off and sound_off
        if (command === 'stop') {
          ws.send(JSON.stringify({ command: 'lights_off' }))
          ws.send(JSON.stringify({ command: 'sound_off' }))
          setTimeout(() => {
            ws.close()
            resolve(true)
          }, 1000)
        } else {
          // Send the activation command
          ws.send(JSON.stringify({ command }))
          
          // Send the off command after 30 seconds
          setTimeout(() => {
            const offCommand = command.replace('_on', '_off')
            ws.send(JSON.stringify({ command: offCommand }))
            // Close the connection after sending the off command
            setTimeout(() => ws.close(), 1000)
          }, 30000)
          
          resolve(true)
        }
      })
      
      ws.on('error', (error) => {
        reject(error)
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error activating deterrent:', error)
    return NextResponse.json({ error: 'Failed to activate deterrent' }, { status: 500 })
  }
}

export async function GET() {
  // Return and clear pending commands
  const commands = [...pendingCommands]
  pendingCommands = []
  return NextResponse.json(commands)
} 