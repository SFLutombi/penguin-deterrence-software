export interface Detection {
  id: number
  microphoneId: string
  frequency: number
  magnitude: number
  timestamp: string
  type: 'frequency' | 'amplitude'
}

export interface Alert {
  type: 'frequency' | 'amplitude'
  message: string
  value: number
  timestamp: number
  microphoneId: string
}

export interface Microphone {
  id: string
  lastDetection: string
  status: 'active' | 'inactive'
} 