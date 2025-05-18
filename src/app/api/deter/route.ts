import { NextResponse } from 'next/server'

// In-memory queue for pending commands (replace with database in production)
let pendingCommands: Array<{
  mode: 'lights' | 'sound' | 'both'
  timestamp: string
}> = []

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate mode
    if (!data.mode || !['lights', 'sound', 'both'].includes(data.mode)) {
      return NextResponse.json(
        { error: 'Invalid mode specified' },
        { status: 400 }
      )
    }

    // Add command to queue
    pendingCommands.push({
      mode: data.mode,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}

export async function GET() {
  // Return and clear pending commands
  const commands = [...pendingCommands]
  pendingCommands = []
  return NextResponse.json(commands)
} 