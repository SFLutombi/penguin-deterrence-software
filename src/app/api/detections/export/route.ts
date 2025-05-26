import { NextResponse } from 'next/server'
const { exportToCSV } = require('@/lib/db')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format')

    if (format !== 'csv') {
      return NextResponse.json(
        { error: 'Unsupported format' },
        { status: 400 }
      )
    }

    const csv = await exportToCSV({ startDate, endDate })
    
    // Create response with CSV content
    const response = new NextResponse(csv)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="detections-${new Date().toISOString()}.csv"`
    )
    
    return response
  } catch (error) {
    console.error('Error exporting detections:', error)
    return NextResponse.json(
      { error: 'Failed to export detections' },
      { status: 500 }
    )
  }
} 