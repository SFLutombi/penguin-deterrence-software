'use client'

import { motion } from 'framer-motion'
import { Download, Play, Trash2 } from 'lucide-react'

// This will be replaced with actual data from your API
const mockRecordings = [
  {
    id: 1,
    timestamp: '2024-03-20 14:30:00',
    duration: '00:05:23',
    microphone: 'Mic 1',
    frequency: '2.5 kHz',
    magnitude: '0.8',
    triggered: true
  },
  {
    id: 2,
    timestamp: '2024-03-20 13:15:00',
    duration: '00:03:45',
    microphone: 'Mic 2',
    frequency: '3.1 kHz',
    magnitude: '0.6',
    triggered: false
  },
  {
    id: 3,
    timestamp: '2024-03-20 12:00:00',
    duration: '00:04:12',
    microphone: 'Mic 3',
    frequency: '2.8 kHz',
    magnitude: '0.7',
    triggered: true
  }
]

export default function RecordingsPage() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audio Recordings</h1>
          <p className="text-gray-600 mt-2">Manage and download audio recordings from your detection system</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Microphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Magnitude</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triggered</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockRecordings.map((recording) => (
                  <tr key={recording.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recording.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recording.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recording.microphone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recording.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recording.magnitude}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        recording.triggered 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recording.triggered ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Play className="h-5 w-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 