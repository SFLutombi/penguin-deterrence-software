import { NextResponse } from 'next/server'
import type { Detection, Alert } from '@/types/detection'
const { getDetections } = require('@/lib/db')

export async function GET(request: Request) {
  try {
    // Get the most recent 10 detections
    const detections = await getDetections({
      limit: 10,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }) as Detection[]

    // Format detections for the alerts display
    const alerts: Alert[] = detections.map(detection => ({
      type: detection.type,
      message: detection.type === 'frequency'
        ? `Penguin detected with frequency ${detection.frequency.toFixed(1)} Hz`
        : `High amplitude detected: ${detection.magnitude.toLocaleString()}`,
      value: detection.type === 'frequency' ? detection.frequency : detection.magnitude,
      threshold: detection.type === 'frequency' ? 400 : 300000, // Default thresholds
      timestamp: new Date(detection.timestamp).getTime(),
      microphoneId: detection.microphoneId
    }))

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
} 