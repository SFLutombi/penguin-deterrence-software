'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Volume2, Activity } from 'lucide-react'

interface Detection {
  type: 'frequency' | 'amplitude'
  message: string
  value: number
  threshold: number
  timestamp: number
  microphoneId: string
}

export function AlertDisplay() {
  const [detections, setDetections] = useState<Detection[]>([])

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const response = await fetch('/api/alerts')
        if (!response.ok) {
          throw new Error('Failed to fetch detections')
        }
        const data = await response.json()
        setDetections(data)
      } catch (error) {
        console.error('Error fetching detections:', error)
      }
    }

    // Initial fetch
    fetchDetections()

    // Poll for new detections every second
    const interval = setInterval(fetchDetections, 1000)

    return () => clearInterval(interval)
  }, [])

  if (detections.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No detections to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <AnimatePresence>
        {detections.map((detection, index) => (
          <motion.div
            key={`${detection.timestamp}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-lg border ${
              detection.type === 'amplitude' 
                ? 'bg-secondary/10 border-secondary' 
                : 'bg-primary/10 border-primary'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${
                detection.type === 'amplitude' 
                  ? 'bg-secondary/20' 
                  : 'bg-primary/20'
              }`}>
                {detection.type === 'amplitude' ? (
                  <Volume2 className="w-4 h-4 text-secondary" />
                ) : (
                  <Activity className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    detection.type === 'amplitude' 
                      ? 'text-secondary' 
                      : 'text-primary'
                  }`}>
                    {detection.type === 'amplitude' ? 'High Amplitude' : 'High Frequency'}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-sm ${
                  detection.type === 'amplitude' 
                    ? 'text-secondary/80' 
                    : 'text-primary/80'
                }`}>
                  {detection.message}
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Microphone: {detection.microphoneId}</p>
                  <p>Value: {detection.value?.toLocaleString() || 'N/A'}{detection.type === 'frequency' ? ' Hz' : ''}</p>
                  {detection.threshold && (
                    <p>Threshold: {detection.threshold?.toLocaleString() || 'N/A'}{detection.type === 'frequency' ? ' Hz' : ''}</p>
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