import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// In-memory store for logs (replace with database in production)
export let logs: Array<{
  espId: string
  magnitude: number
  frequency: number
  timestamp: string
  triggered: boolean
}> = []

// Helper function to handle CORS
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Received log request:', data)
    
    // Validate required fields
    const missingFields = []
    if (!data.espId) missingFields.push('espId')
    if (data.magnitude === undefined && data.value === undefined) missingFields.push('magnitude/value')
    if (data.frequency === undefined) missingFields.push('frequency')
    if (!data.timestamp) missingFields.push('timestamp')

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return corsResponse(NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      ))
    }

    // Add to logs with triggered flag (defaults to false if not provided)
    const logEntry = {
      espId: data.espId,
      magnitude: data.magnitude || data.value || 0,
      frequency: data.frequency || 0,
      timestamp: data.timestamp,
      triggered: data.triggered || false
    }
    
    logs.push(logEntry)
    console.log('Added log entry:', logEntry)
    console.log('Current log count:', logs.length)
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(-100)
      console.log('Trimmed logs to last 100 entries')
    }

    return corsResponse(NextResponse.json({ 
      success: true,
      message: 'Log entry added successfully',
      entry: logEntry
    }))
  } catch (error) {
    console.error('Error processing log request:', error)
    return corsResponse(NextResponse.json(
      { error: 'Invalid request data', details: error.message },
      { status: 400 }
    ))
  }
}

// Add GET endpoint to fetch logs
export async function GET() {
  console.log('GET /api/log - Returning', logs.length, 'entries')
  return corsResponse(NextResponse.json(logs))
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return corsResponse(NextResponse.json({}, { status: 200 }))
} 