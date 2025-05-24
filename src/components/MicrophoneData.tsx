'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface MicrophoneData {
  amplitude: number
  frequency: number
  timestamp: number
  port: string
  connected: boolean
  lastUpdate: number
  penguinDetected: boolean
}

interface MicrophoneDataProps {
  microphoneId: 'microphone1' | 'microphone2' | 'microphone3'
}

export function MicrophoneData({ microphoneId }: MicrophoneDataProps) {
  const [data, setData] = useState<MicrophoneData>({
    amplitude: 0,
    frequency: 0,
    timestamp: 0,
    port: '',
    connected: false,
    lastUpdate: 0,
    penguinDetected: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        // Fetch microphone data
        const response = await fetch(`http://localhost:3001/api/microphones/${microphoneId}`)
        if (!response.ok) {
          throw new Error('Microphone not connected')
        }
        
        const newData = await response.json()
        
        if (isMounted) {
          setData(newData)
        }
      } catch (error) {
        if (isMounted) {
          console.log(`[${microphoneId}] Not connected`)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling interval
    const interval = setInterval(fetchData, 100)

    // Cleanup
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [microphoneId])

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg animate-pulse">
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 bg-blue-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    )
  }

  const cardClasses = `p-6 rounded-xl border transition-all duration-300 ${
    !data.connected
      ? 'bg-gray-50 border-gray-200'
      : data.penguinDetected
        ? 'bg-red-50 border-red-300 shadow-lg shadow-red-100 animate-pulse'
        : 'bg-white border-gray-200 hover:shadow-lg'
  }`

  if (!data.connected) {
    return (
      <div className={cardClasses}>
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Microphone {microphoneId.slice(-1)}</h3>
          <p className="text-sm text-gray-500">Not connected</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClasses}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Microphone {microphoneId.slice(-1)}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${data.penguinDetected ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-medium ${data.penguinDetected ? 'text-red-600' : 'text-green-600'}`}>
              {data.penguinDetected ? 'Penguin Detected!' : 'No Penguins'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Amplitude</p>
            <motion.p
              className="text-2xl font-bold text-blue-600"
              animate={{ scale: data.penguinDetected ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {data.amplitude.toLocaleString()}
            </motion.p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Frequency</p>
            <motion.p
              className="text-2xl font-bold text-green-600"
              animate={{ scale: data.penguinDetected ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {data.frequency.toFixed(1)}
              <span className="text-sm ml-1">Hz</span>
            </motion.p>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Port: {data.port}</p>
          <p>Last Update: {new Date(data.lastUpdate).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
} 