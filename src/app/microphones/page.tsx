'use client'

import { motion } from 'framer-motion'
import { Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react'

// This will be replaced with actual data from your API
const mockMicrophones = [
  {
    id: 1,
    name: 'Microphone 1',
    location: 'North Perimeter',
    status: 'online',
    lastSeen: '2 minutes ago',
    currentFrequency: '2.5 kHz',
    currentMagnitude: '0.8',
    sensitivity: 75,
    threshold: 0.6
  },
  {
    id: 2,
    name: 'Microphone 2',
    location: 'East Perimeter',
    status: 'offline',
    lastSeen: '15 minutes ago',
    currentFrequency: '0 kHz',
    currentMagnitude: '0.0',
    sensitivity: 80,
    threshold: 0.7
  },
  {
    id: 3,
    name: 'Microphone 3',
    location: 'South Perimeter',
    status: 'online',
    lastSeen: '1 minute ago',
    currentFrequency: '3.1 kHz',
    currentMagnitude: '0.5',
    sensitivity: 70,
    threshold: 0.5
  }
]

export default function MicrophonesPage() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Microphones</h1>
          <p className="text-gray-600 mt-2">Monitor and configure your detection microphones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMicrophones.map((mic) => (
            <motion.div
              key={mic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: mic.id * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{mic.name}</h2>
                {mic.status === 'online' ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900">{mic.location}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${
                    mic.status === 'online' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mic.status === 'online' ? 'Online' : 'Offline'} • Last seen {mic.lastSeen}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Frequency</p>
                    <p className="text-gray-900">{mic.currentFrequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Magnitude</p>
                    <p className="text-gray-900">{mic.currentMagnitude}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Sensitivity</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${mic.sensitivity}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Threshold</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${mic.threshold * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Configure
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    View Logs
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 