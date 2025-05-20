'use client'

import { motion } from 'framer-motion'

export default function StatsPage() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Detection Statistics</h1>
          <p className="text-gray-600 mt-2">View historical data and trends from your penguin detection system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Frequency Analysis Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequency Analysis</h2>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Frequency analysis chart will be displayed here</p>
            </div>
          </motion.div>

          {/* Magnitude Analysis Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Magnitude Analysis</h2>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Magnitude analysis chart will be displayed here</p>
            </div>
          </motion.div>

          {/* Detection Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detection Timeline</h2>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Timeline of detections will be displayed here</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 