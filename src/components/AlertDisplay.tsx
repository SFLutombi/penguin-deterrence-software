'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Volume2, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Detection {
  type: 'penguin'
  message: string
  frequency: number
  magnitude: number
  timestamp: number
  microphoneId: string
}

export function AlertDisplay() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Initial fetch
    fetchAlerts()

    // Set up polling every 5 seconds
    const interval = setInterval(fetchAlerts, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const data = await response.json()
      setDetections(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Recent Detections ({detections.length})</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className={cn(
        "space-y-2 overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[500px]" : "max-h-[150px]",
        "overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-muted-foreground/20 scrollbar-track-muted-foreground/10"
      )}>
        <AnimatePresence>
          {detections.map((detection, index) => (
            <motion.div
              key={`${detection.timestamp}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-4 p-3 rounded-lg border bg-primary/5 border-primary/20"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-primary truncate">
                    Penguin Detected
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-primary/80 truncate">
                  {detection.message}
                </p>
                <div className="mt-1 text-xs text-muted-foreground grid grid-cols-3 gap-2">
                  <p className="truncate">ID: {detection.microphoneId}</p>
                  <p className="truncate">Freq: {detection.frequency.toFixed(1)} Hz</p>
                  <p className="truncate">Amp: {detection.magnitude.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 