'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Volume2, Activity } from 'lucide-react'

interface Alert {
  type: 'amplitude' | 'frequency'
  message: string
  value: number
  threshold: number
  timestamp: number
}

export function AlertDisplay() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/alerts')
        if (!response.ok) {
          throw new Error('Failed to fetch alerts')
        }
        const data = await response.json()
        setAlerts(data)
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    // Initial fetch
    fetchAlerts()

    // Poll for new alerts every second
    const interval = setInterval(fetchAlerts, 1000)

    return () => clearInterval(interval)
  }, [])

  if (alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No alerts to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <motion.div
            key={`${alert.timestamp}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-lg border ${
              alert.type === 'amplitude' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${
                alert.type === 'amplitude' 
                  ? 'bg-red-100' 
                  : 'bg-yellow-100'
              }`}>
                {alert.type === 'amplitude' ? (
                  <Volume2 className="w-4 h-4 text-red-600" />
                ) : (
                  <Activity className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    alert.type === 'amplitude' 
                      ? 'text-red-900' 
                      : 'text-yellow-900'
                  }`}>
                    {alert.type === 'amplitude' ? 'High Amplitude' : 'High Frequency'}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-sm ${
                  alert.type === 'amplitude' 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                }`}>
                  {alert.message}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Value: {alert.value.toLocaleString()}{alert.type === 'frequency' ? ' Hz' : ''}</p>
                  {alert.threshold && (
                    <p>Threshold: {alert.threshold.toLocaleString()}{alert.type === 'frequency' ? ' Hz' : ''}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
} 