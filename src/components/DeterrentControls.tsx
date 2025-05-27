'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"
import { useWebSocket } from "@/contexts/WebSocketContext"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, StopCircle } from "lucide-react"

type DeterrentMode = 'lights' | 'sound' | 'both' | 'stop'

export function DeterrentControls() {
  const [isActivating, setIsActivating] = useState(false)
  const { microphoneData } = useWebSocket()

  // Check if any microphone has detected a penguin
  const isPenguinDetected = Object.values(microphoneData).some(
    (data) => {
      if (!data.fftData) return false;
      // Check if the frequency is in the penguin vocalization range (typically 800-3000 Hz)
      // and the magnitude is significant enough
      return data.fftData.frequency >= 800 && 
             data.fftData.frequency <= 3000 && 
             data.fftData.magnitude > 50;
    }
  )

  const activateDeterrent = async (mode: DeterrentMode) => {
    try {
      setIsActivating(true)
      const response = await fetch('/api/deter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      })

      if (!response.ok) {
        throw new Error('Failed to activate deterrent')
      }

      if (mode === 'stop') {
        toast.success('All deterrents stopped')
      } else {
        toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} deterrent activated`)
      }
    } catch (error) {
      toast.error('Failed to activate deterrent')
      console.error('Error activating deterrent:', error)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Card className={cn(
      "transition-all duration-500",
      isPenguinDetected && "shadow-[0_0_30px_rgba(220,38,38,0.3)] border-red-500"
    )}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deterrent Controls</CardTitle>
        <AnimatePresence>
          {isPenguinDetected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 text-red-500"
            >
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Penguin Detected!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant={isPenguinDetected ? "destructive" : "outline"}
            disabled={isActivating}
            onClick={() => activateDeterrent('lights')}
            className={cn(
              "transition-all duration-300",
              isPenguinDetected && "animate-pulse shadow-lg"
            )}
          >
            Activate Lights
          </Button>
          <Button
            variant={isPenguinDetected ? "destructive" : "outline"}
            disabled={isActivating}
            onClick={() => activateDeterrent('sound')}
            className={cn(
              "transition-all duration-300",
              isPenguinDetected && "animate-pulse shadow-lg"
            )}
          >
            Activate Sound
          </Button>
          <Button
            variant={isPenguinDetected ? "destructive" : "secondary"}
            disabled={isActivating}
            onClick={() => activateDeterrent('both')}
            className={cn(
              "transition-all duration-300",
              isPenguinDetected && "animate-pulse shadow-lg"
            )}
          >
            Activate Both
          </Button>
        </div>
        
        <div className="flex justify-center">
          <Button
            variant="destructive"
            size="lg"
            disabled={isActivating}
            onClick={() => activateDeterrent('stop')}
            className="w-full md:w-1/2"
          >
            <StopCircle className="mr-2 h-5 w-5" />
            Stop All Deterrents
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 