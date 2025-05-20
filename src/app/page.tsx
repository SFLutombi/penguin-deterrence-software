'use client'

import { AlertDisplay } from '@/components/AlertDisplay'
import { DeterrentControls } from '@/components/DeterrentControls'
import { Toaster } from 'sonner'
import { motion } from 'framer-motion'
import { MicrophoneData } from '@/components/MicrophoneData'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h1 
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Penguin Deterrence System
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Advanced monitoring and control system for penguin deterrence
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Alert Monitor</h2>
            <AlertDisplay />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Deterrent Controls</h2>
            <DeterrentControls />
          </motion.section>
        </div>

        <div className="mt-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Microphone Status
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Microphone 1 (COM1)</h3>
              <MicrophoneData microphoneId="microphone1" />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Microphone 2 (COM2)</h3>
              <MicrophoneData microphoneId="microphone2" />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Microphone 3 (COM3)</h3>
              <MicrophoneData microphoneId="microphone3" />
            </motion.section>
          </div>
        </div>
      </motion.div>
    </main>
  )
} 