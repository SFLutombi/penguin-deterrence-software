'use client'

import { useEffect, useState } from 'react'
import { Detection, columns } from '@/components/DetectionHistory/columns'
import { DataTable } from '@/components/DetectionHistory/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DetectionStats {
  microphoneId: string
  total_detections: number
  penguin_detections: number
  amplitude_alerts: number
  avg_frequency: number
  max_frequency: number
  avg_magnitude: number
  max_magnitude: number
  first_detection: string
  last_detection: string
}

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [stats, setStats] = useState<DetectionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date()
  })

  // Fetch detections with date range
  const fetchDetections = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      })
      
      const response = await fetch(`/api/detections?${params}`)
      if (!response.ok) throw new Error('Failed to fetch detections')
      const data = await response.json()
      setDetections(data)
    } catch (error) {
      console.error('Error fetching detections:', error)
    }
  }

  // Fetch statistics with date range
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      })
      
      const response = await fetch(`/api/detections/stats?${params}`)
      if (!response.ok) throw new Error('Failed to fetch statistics')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  // Export detections to CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        format: 'csv'
      })
      
      const response = await fetch(`/api/detections/export?${params}`)
      if (!response.ok) throw new Error('Failed to export detections')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `detections-${new Date().toISOString()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting detections:', error)
    }
  }

  // Update data when date range changes
  useEffect(() => {
    setLoading(true)
    Promise.all([fetchDetections(), fetchStats()])
      .finally(() => setLoading(false))
  }, [dateRange])

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.microphoneId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.microphoneId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.total_detections}</div>
              <p className="text-xs text-muted-foreground">
                {stat.penguin_detections} penguin detections
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-xs">
                  Max Frequency: {stat.max_frequency?.toFixed(1) || 'N/A'} Hz
                </div>
                <div className="text-xs">
                  Max Magnitude: {stat.max_magnitude?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="space-y-4">
          <DataTable
            columns={columns}
            data={detections}
            onExport={handleExport}
            onDateRangeChange={setDateRange}
          />
        </TabsContent>
        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-2">
            {stats.map((stat) => (
              <Card key={stat.microphoneId}>
                <CardHeader>
                  <CardTitle>{stat.microphoneId} - Detailed Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total Detections</p>
                      <p className="text-2xl font-bold">{stat.total_detections}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Penguin Detections</p>
                      <p className="text-2xl font-bold">{stat.penguin_detections}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Average Frequency</p>
                      <p className="text-xl">{stat.avg_frequency?.toFixed(1) || 'N/A'} Hz</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Max Frequency</p>
                      <p className="text-xl">{stat.max_frequency?.toFixed(1) || 'N/A'} Hz</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Average Magnitude</p>
                      <p className="text-xl">{stat.avg_magnitude?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Max Magnitude</p>
                      <p className="text-xl">{stat.max_magnitude?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm font-medium">Detection Period</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(stat.first_detection).toLocaleString()} to{' '}
                      {new Date(stat.last_detection).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 