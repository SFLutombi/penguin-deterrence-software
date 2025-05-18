import { NextResponse } from 'next/server'

// In-memory store for logs (replace with database in production)
let logs: Array<{
  espId: string
  magnitude: number
  frequency: number
  timestamp: string
  triggered: boolean
}> = []

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.espId || !data.magnitude || !data.frequency || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add to logs with triggered flag (defaults to false if not provided)
    logs.push({
      ...data,
      triggered: data.triggered || false
    })
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(-100)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json(logs)
} 