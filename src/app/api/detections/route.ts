import { NextResponse } from 'next/server'
import type { Detection } from '@/types/detection'
const { getDetections } = require('@/lib/db')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const microphoneId = searchParams.get('microphoneId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Get detections
    const detections = await getDetections({
      microphoneId,
      startDate,
      endDate,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }) as Detection[]

    // Format detections for frontend
    const formattedDetections = detections.map(detection => ({
      id: detection.id,
      microphoneId: detection.microphoneId,
      type: detection.type,
      frequency: detection.frequency,
      magnitude: detection.magnitude,
      timestamp: detection.timestamp
    }))

    return NextResponse.json(formattedDetections)
  } catch (error) {
    console.error('Error fetching detections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch detections' },
      { status: 500 }
    )
  }
}

// Constants for thresholds (matching WebSocket server)
const THRESHOLDS = {
  frequency: {
    min: 1000,
    max: 5000
  },
  amplitude: 5000
} 