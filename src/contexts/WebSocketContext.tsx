'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface MicrophoneData {
  fftData: { frequency: number; magnitude: number } | null;
  amplitudeData: { value: number } | null;
  lastUpdate: number;
}

interface WebSocketContextType {
  microphoneData: {
    m1: MicrophoneData;
    m2: MicrophoneData;
    m3: MicrophoneData;
  };
  isConnected: boolean;
}

const defaultMicData: MicrophoneData = {
  fftData: null,
  amplitudeData: null,
  lastUpdate: 0,
};

const WebSocketContext = createContext<WebSocketContextType>({
  microphoneData: {
    m1: defaultMicData,
    m2: defaultMicData,
    m3: defaultMicData,
  },
  isConnected: false,
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [microphoneData, setMicrophoneData] = useState<WebSocketContextType['microphoneData']>({
    m1: defaultMicData,
    m2: defaultMicData,
    m3: defaultMicData,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws) {
      ws.close();
    }

    const newWs = new WebSocket('ws://localhost:3001');

    newWs.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);

        if (!data.micId) return; // Ignore messages without micId

        setMicrophoneData(prev => ({
          ...prev,
          [data.micId]: {
            ...prev[data.micId as keyof typeof prev],
            ...(data.type === 'fft' ? {
              fftData: { frequency: data.frequency, magnitude: data.magnitude }
            } : {}),
            ...(data.type === 'amplitude' ? {
              amplitudeData: { value: data.value }
            } : {}),
            lastUpdate: Date.now(),
          }
        }));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    newWs.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      // Attempt to reconnect after 2 seconds
      setTimeout(() => connect(), 2000);
    };

    setWs(newWs);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ microphoneData, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext); 