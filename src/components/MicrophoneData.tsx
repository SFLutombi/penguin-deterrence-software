'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface MicrophoneData {
  amplitude: number
  frequency: number
  timestamp: number
  port: string
}

interface MicrophoneDataProps {
  microphoneId: 'microphone1' | 'microphone2' | 'microphone3'
}

export function MicrophoneData({ microphoneId }: MicrophoneDataProps) {
  const [data, setData] = useState<MicrophoneData>({
    amplitude: 0,
    frequency: 0,
    timestamp: 0,
    port: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/microphones/${microphoneId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
        }
        const newData = await response.json()
        console.log(`Received data for ${microphoneId}:`, newData)
        setData(newData)
        setError(null)
        setLastFetchTime(Date.now())
        
        // Check if microphone is offline based on data values
        // A microphone is considered online if it has any non-zero data
        const hasValidData = newData.amplitude !== 0 || newData.frequency !== 0
        console.log(`${microphoneId} status:`, {
          hasValidData,
          amplitude: newData.amplitude,
          frequency: newData.frequency,
          isOffline: !hasValidData
        })
        setIsOffline(!hasValidData)
      } catch (err) {
        console.error(`Error fetching data for ${microphoneId}:`, err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setIsOffline(true)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch data every 100ms
    const interval = setInterval(fetchData, 100)
    return () => clearInterval(interval)
  }, [microphoneId])

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-blue-100 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="text-lg font-semibold text-blue-700">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <p className="text-lg font-semibold text-red-700">Error</p>
        </div>
        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
      </div>
    )
  }

  // Show offline state
  if (isOffline) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <p className="text-lg font-semibold text-gray-700">Offline</p>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Last values: {data.amplitude.toFixed(2)} / {data.frequency.toFixed(2)} Hz
        </p>
      </div>
    )
  }

  // Show online state with data
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <p className="text-lg font-semibold text-green-700">Online</p>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-700">Amplitude</h2>
            <motion.p 
              className="text-3xl font-bold text-blue-600"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {data.amplitude.toFixed(2)}
            </motion.p>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-700">Frequency</h2>
            <motion.p 
              className="text-3xl font-bold text-green-600"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {data.frequency.toFixed(2)} Hz
            </motion.p>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            <p>Last Update: {new Date(data.timestamp).toLocaleTimeString()}</p>
            <p>Port: {data.port}</p>
          </div>
          <div>
            <p>Last Fetch: {new Date(lastFetchTime).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 