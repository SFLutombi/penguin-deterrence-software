'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface MicrophoneData {
  frequency: number
  magnitude: number
  timestamp: string
}

export function MicrophoneData() {
  const [data, setData] = useState<MicrophoneData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/serial')
        const result = await response.json()
        setIsConnected(result.connected)
      } catch (error) {
        console.error('Failed to check connection:', error)
        setIsConnected(false)
      }
    }

    // Check connection status every 5 seconds
    const interval = setInterval(checkConnection, 5000)
    checkConnection() // Initial check

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Microphone Data</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {data ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.frequency.toFixed(2)} Hz
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Magnitude</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.magnitude.toFixed(2)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Update</p>
            <p className="text-sm text-gray-900">{data.timestamp}</p>
          </div>
        </motion.div>
      ) : (
        <div className="h-32 flex items-center justify-center">
          <p className="text-gray-500">Waiting for data...</p>
        </div>
      )}
    </div>
  )
} 