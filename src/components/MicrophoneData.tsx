'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MicrophoneDataProps {
  microphoneId: 'microphone1' | 'microphone2' | 'microphone3'
}

const micIdMap = {
  microphone1: 'm1',
  microphone2: 'm2',
  microphone3: 'm3',
} as const;

const MAX_DATA_POINTS = 50;

export function MicrophoneData({ microphoneId }: MicrophoneDataProps) {
  const { microphoneData } = useWebSocket();
  const micId = micIdMap[microphoneId];
  const data = microphoneData[micId];
  
  const [penguinDetected, setPenguinDetected] = useState(false);
  const isConnected = Date.now() - data.lastUpdate < 5000;

  // State for historical data
  const [frequencyHistory, setFrequencyHistory] = useState<number[]>([]);
  const [amplitudeHistory, setAmplitudeHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);

  // Update historical data
  useEffect(() => {
    if (data.fftData) {
      const now = new Date().toLocaleTimeString();
      
      setFrequencyHistory(prev => {
        const newData = [...prev, data.fftData!.frequency];
        return newData.slice(-MAX_DATA_POINTS);
      });
      
      setAmplitudeHistory(prev => {
        const newData = [...prev, data.fftData!.amplitude];
        return newData.slice(-MAX_DATA_POINTS);
      });
      
      setTimeLabels(prev => {
        const newLabels = [...prev, now];
        return newLabels.slice(-MAX_DATA_POINTS);
      });
    }
  }, [data.fftData]);

  // Update penguin detection
  useEffect(() => {
    if (data.fftData) {
      setPenguinDetected(data.fftData.frequency >= 1000 && data.fftData.frequency <= 2500);
    }
  }, [data.fftData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 250
    } as const,
    scales: {
      x: {
        display: false,
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      },
    },
  };

  const frequencyChartData = {
    labels: timeLabels,
    datasets: [
      {
        data: frequencyHistory,
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        fill: true,
      },
    ],
  };

  const amplitudeChartData = {
    labels: timeLabels,
    datasets: [
      {
        data: amplitudeHistory,
        borderColor: 'hsl(var(--secondary))',
        backgroundColor: 'hsl(var(--secondary) / 0.1)',
        fill: true,
      },
    ],
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Microphone {microphoneId.slice(-1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-muted-foreground">
              Offline
            </Badge>
            <p className="text-xs text-muted-foreground">
              Last seen: {new Date(data.lastUpdate).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      penguinDetected && "border-destructive animate-pulse"
    )}>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Microphone {microphoneId.slice(-1)}
          </CardTitle>
          <Badge variant={penguinDetected ? "destructive" : "secondary"}>
            {penguinDetected ? 'Penguin Detected!' : 'No Penguins'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Frequency</p>
            <div className="h-[100px] mb-2">
              <Line data={frequencyChartData} options={chartOptions} />
            </div>
            <p className="text-xl font-bold">
              {data.fftData?.frequency.toFixed(1) ?? '0'}
              <span className="text-sm ml-1 text-muted-foreground">Hz</span>
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Amplitude</p>
            <div className="h-[100px] mb-2">
              <Line data={amplitudeChartData} options={chartOptions} />
            </div>
            <p className="text-xl font-bold">
              {data.fftData?.amplitude.toLocaleString() ?? '0'}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <p>Status: Online</p>
          <p>Last Update: {new Date(data.lastUpdate).toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  )
} 