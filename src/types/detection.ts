export interface Detection {
  id: number
  microphoneId: string
  frequency: number
  magnitude: number
  timestamp: string
  type: 'frequency' | 'amplitude'
}

export interface Alert {
  type: 'penguin'
  message: string
  frequency: number
  magnitude: number
  timestamp: number
  microphoneId: string
}

export interface Microphone {
  id: string
  lastDetection: string
  status: 'active' | 'inactive'
} 