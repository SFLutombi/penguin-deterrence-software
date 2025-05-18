import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"

type DeterrentMode = 'lights' | 'sound' | 'both'

export function DeterrentControls() {
  const [isActivating, setIsActivating] = useState(false)

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

      toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} deterrent activated`)
    } catch (error) {
      toast.error('Failed to activate deterrent')
      console.error('Error activating deterrent:', error)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deterrent Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            disabled={isActivating}
            onClick={() => activateDeterrent('lights')}
          >
            Activate Lights
          </Button>
          <Button
            variant="outline"
            disabled={isActivating}
            onClick={() => activateDeterrent('sound')}
          >
            Activate Sound
          </Button>
          <Button
            variant="default"
            className="bg-red-500 hover:bg-red-600"
            disabled={isActivating}
            onClick={() => activateDeterrent('both')}
          >
            Activate Both
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 