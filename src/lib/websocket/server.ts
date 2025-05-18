import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';
import type { Socket as ClientSocket } from 'socket.io-client';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  fftData: (data: { frequency: number; magnitude: number }) => void;
  amplitudeData: (data: { type: string; value: number }) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  deviceId: string;
}

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export const initializeSocket = (server: HTTPServer) => {
  if (!io) {
    io = new Server(server, {
      path: '/api/esp32',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Handle FFT data
      socket.on('fftData', (data) => {
        console.log('Received FFT data:', data);
        // Broadcast to all connected clients
        io?.emit('fftData', data);
      });

      // Handle amplitude data
      socket.on('amplitudeData', (data) => {
        console.log('Received amplitude data:', data);
        // Broadcast to all connected clients
        io?.emit('amplitudeData', data);
      });
    });
  }
  return io;
};

export const getSocketIO = () => io; 