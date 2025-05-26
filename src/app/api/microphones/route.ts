import { NextResponse } from 'next/server'
import type { Detection, Microphone } from '@/types/detection'
const { getDetections } = require('@/lib/db')

export async function GET(request: Request) {
  try {
    // Get recent detections to find active microphones
    const detections = await getDetections({
      limit: 1000, // Look at recent detections to find all microphones
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }) as Detection[]

    // Extract unique microphone IDs and their last detection time
    const microphoneMap = new Map<string, Microphone>()
    detections.forEach(detection => {
      if (!microphoneMap.has(detection.microphoneId)) {
        microphoneMap.set(detection.microphoneId, {
          id: detection.microphoneId,
          lastDetection: detection.timestamp,
          status: 'active'
        })
      }
    })

    // Convert to array and sort by ID
    const microphones = Array.from(microphoneMap.values())
      .sort((a, b) => a.id.localeCompare(b.id))

    return NextResponse.json(microphones)
  } catch (error) {
    console.error('Error fetching microphones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch microphones' },
      { status: 500 }
    )
  }
} 