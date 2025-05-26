'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'

interface MicrophoneSettings {
  id: string
  name: string
  location: string
  port: string
  thresholds: {
    amplitude: number
    frequency: number
  }
  sensitivity: number
}

interface MicrophoneData {
  amplitude: number
  frequency: number
  connected: boolean
  lastUpdate: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<MicrophoneSettings[]>([])
  const [micData, setMicData] = useState<Record<string, MicrophoneData>>({})
  const [loading, setLoading] = useState(true)

  // Load initial settings and microphone data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsResponse = await fetch('http://localhost:3001/api/settings')
        if (!settingsResponse.ok) {
          throw new Error('Failed to fetch settings')
        }
        const settingsData = await settingsResponse.json()
        const settingsArray = Object.values(settingsData) as MicrophoneSettings[]
        setSettings(settingsArray)

        // Fetch microphone data
        const micResponse = await fetch('http://localhost:3001/api/microphones')
        if (micResponse.ok) {
          const data = await micResponse.json()
          setMicData(data as Record<string, MicrophoneData>)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        alert('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up polling for microphone data
    const interval = setInterval(async () => {
      try {
        const micResponse = await fetch('http://localhost:3001/api/microphones')
        if (micResponse.ok) {
          const data = await micResponse.json()
          setMicData(data as Record<string, MicrophoneData>)
        }
      } catch (error) {
        console.error('Error updating microphone data:', error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSettingChange = (micId: string, field: string, value: any) => {
    setSettings(prev => prev.map(mic => {
      if (mic.id === micId) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.')
          return {
            ...mic,
            [parent]: {
              ...mic[parent as keyof typeof mic],
              [child]: value
            }
          }
        }
        return { ...mic, [field]: value }
      }
      return mic
    }))
  }

  const handleSave = async () => {
    try {
      // Convert settings array back to object format expected by the server
      const settingsObject = settings.reduce((acc, mic) => ({
        ...acc,
        [mic.id]: mic
      }), {})

      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsObject })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      alert('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

        <div className="space-y-8">
          {settings.map((mic) => {
            const currentData = micData[mic.id] || {
              amplitude: 0,
              frequency: 0,
              connected: false,
              lastUpdate: Date.now()
            }

            return (
              <motion.div
                key={mic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl shadow-sm p-6 border ${
                  currentData.connected ? 'border-secondary bg-secondary/10' : 'border-muted bg-background'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">{mic.name}</h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${currentData.connected ? 'bg-secondary' : 'bg-muted'}`} />
                    <span className={`text-sm ${currentData.connected ? 'text-secondary' : 'text-muted-foreground'}`}>
                      {currentData.connected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={mic.location}
                        onChange={(e) => handleSettingChange(mic.id, 'location', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Port</label>
                      <input
                        type="text"
                        value={mic.port}
                        onChange={(e) => handleSettingChange(mic.id, 'port', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Amplitude Threshold
                      </label>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="1000000"
                            step="1000"
                            value={mic.thresholds.amplitude}
                            onChange={(e) => handleSettingChange(mic.id, 'thresholds.amplitude', Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm text-gray-600 w-20">
                            {mic.thresholds.amplitude.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Current: {currentData.amplitude.toLocaleString()}</span>
                          <span className={currentData.amplitude > mic.thresholds.amplitude ? 'text-red-500 font-medium' : ''}>
                            {currentData.amplitude > mic.thresholds.amplitude ? 'Threshold Exceeded' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Frequency Threshold (Hz)
                      </label>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="2000"
                            step="10"
                            value={mic.thresholds.frequency}
                            onChange={(e) => handleSettingChange(mic.id, 'thresholds.frequency', Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm text-gray-600 w-16">
                            {mic.thresholds.frequency} Hz
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Current: {currentData.frequency.toFixed(1)} Hz</span>
                          <span className={currentData.frequency > mic.thresholds.frequency ? 'text-red-500 font-medium' : ''}>
                            {currentData.frequency > mic.thresholds.frequency ? 'Threshold Exceeded' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sensitivity
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mic.sensitivity}
                          onChange={(e) => handleSettingChange(mic.id, 'sensitivity', Number(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-600 w-12">
                          {mic.sensitivity}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
} 