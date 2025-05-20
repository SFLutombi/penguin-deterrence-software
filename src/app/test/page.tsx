'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MicrophoneData {
  amplitude: number;
  frequency: number;
  timestamp: number;
}

export default function TestPage() {
  const [data, setData] = useState<MicrophoneData>({
    amplitude: 0,
    frequency: 0,
    timestamp: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/microphone');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const newData = await response.json();
        setData(newData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    // Fetch data every 100ms
    const interval = setInterval(fetchData, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Microphone Test Page</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <h2 className="text-xl font-semibold mb-4">Amplitude</h2>
            <p className="text-4xl font-bold text-blue-600">
              {data.amplitude.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <h2 className="text-xl font-semibold mb-4">Frequency</h2>
            <p className="text-4xl font-bold text-green-600">
              {data.frequency.toFixed(2)} Hz
            </p>
          </motion.div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Last Update</h2>
          <p className="text-gray-600">
            {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
} 