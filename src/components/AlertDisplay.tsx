import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

type LogEntry = {
  espId: string
  magnitude: number
  frequency: number
  timestamp: string
}

export function AlertDisplay() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [latestAlert, setLatestAlert] = useState<LogEntry | null>(null)

  // Fetch logs periodically
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/log')
        const data = await response.json()
        setLogs(data)
        
        // Set latest alert if new data is received
        if (data.length > 0 && (!latestAlert || data[data.length - 1].timestamp !== latestAlert.timestamp)) {
          setLatestAlert(data[data.length - 1])
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      }
    }

    // Initial fetch
    fetchLogs()

    // Poll every 2 seconds
    const interval = setInterval(fetchLogs, 2000)

    return () => clearInterval(interval)
  }, [latestAlert])

  return (
    <div className="space-y-4">
      {/* Latest Alert */}
      {latestAlert && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTitle>New Detection!</AlertTitle>
          <AlertDescription>
            ESP32 {latestAlert.espId} detected activity at {new Date(latestAlert.timestamp).toLocaleTimeString()}
            <br />
            Magnitude: {latestAlert.magnitude.toFixed(2)} | Frequency: {latestAlert.frequency.toFixed(2)} Hz
          </AlertDescription>
        </Alert>
      )}

      {/* Log History */}
      <Card>
        <CardHeader>
          <CardTitle>Detection History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.slice().reverse().map((log, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="mx-2">|</span>
                <span>ESP32 {log.espId}</span>
                <span className="mx-2">|</span>
                <span>Mag: {log.magnitude.toFixed(2)}</span>
                <span className="mx-2">|</span>
                <span>Freq: {log.frequency.toFixed(2)} Hz</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 