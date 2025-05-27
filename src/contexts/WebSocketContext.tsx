'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface MicrophoneData {
  fftData: { frequency: number; magnitude: number; amplitude: number } | null;
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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
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

        if (data.type === 'fft') {
          setMicrophoneData(prev => ({
            ...prev,
            [data.micId]: {
              ...prev[data.micId as keyof typeof prev],
              fftData: {
                frequency: data.frequency,
                magnitude: data.magnitude,
                amplitude: data.amplitude
              },
              lastUpdate: Date.now(),
            }
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (wsRef.current === newWs) {
        setIsConnected(false);
      }
    };

    newWs.onclose = () => {
      console.log('Disconnected from WebSocket server');
      if (wsRef.current === newWs) {
        setIsConnected(false);
        // Schedule reconnection only if this is still the current connection
        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current === newWs) {
            connect();
          }
        }, 2000);
      }
    };

    wsRef.current = newWs;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
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