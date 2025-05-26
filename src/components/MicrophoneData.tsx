'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useWebSocket } from '@/contexts/WebSocketContext'

interface MicrophoneDataProps {
  microphoneId: 'microphone1' | 'microphone2' | 'microphone3'
}

export function MicrophoneData({ microphoneId }: MicrophoneDataProps) {
  const { fftData, amplitudeData } = useWebSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [penguinDetected, setPenguinDetected] = useState(false);

  // Update penguin detection based on frequency
  useEffect(() => {
    if (fftData) {
      // Check if frequency is in penguin range (1000-2500 Hz)
      setPenguinDetected(fftData.frequency >= 1000 && fftData.frequency <= 2500);
    }
  }, [fftData]);

  // Update connection status when we receive data
  useEffect(() => {
    if (fftData || amplitudeData) {
      setIsConnected(true);
    }
  }, [fftData, amplitudeData]);

  const cardClasses = `p-6 rounded-xl border transition-all duration-300 ${
    !isConnected
      ? 'bg-gray-50 border-gray-200'
      : penguinDetected
        ? 'bg-red-50 border-red-300 shadow-lg shadow-red-100 animate-pulse'
        : 'bg-white border-gray-200 hover:shadow-lg'
  }`

  if (!isConnected) {
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
            <div className={`w-2 h-2 rounded-full ${penguinDetected ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-medium ${penguinDetected ? 'text-red-600' : 'text-green-600'}`}>
              {penguinDetected ? 'Penguin Detected!' : 'No Penguins'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Amplitude</p>
            <motion.p
              className="text-2xl font-bold text-blue-600"
              animate={{ scale: penguinDetected ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {amplitudeData?.value.toLocaleString() ?? '0'}
            </motion.p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Frequency</p>
            <motion.p
              className="text-2xl font-bold text-green-600"
              animate={{ scale: penguinDetected ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {fftData?.frequency.toFixed(1) ?? '0'}
              <span className="text-sm ml-1">Hz</span>
            </motion.p>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Status: Connected</p>
          <p>Last Update: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
} 