'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  fftData: { frequency: number; magnitude: number } | null;
  amplitudeData: { value: number } | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  fftData: null,
  amplitudeData: null,
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [fftData, setFftData] = useState<{ frequency: number; magnitude: number } | null>(null);
  const [amplitudeData, setAmplitudeData] = useState<{ value: number } | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);

        if (data.type === 'fft') {
          setFftData({ frequency: data.frequency, magnitude: data.magnitude });
        } else if (data.type === 'amplitude') {
          setAmplitudeData({ value: data.value });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ fftData, amplitudeData }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
} 