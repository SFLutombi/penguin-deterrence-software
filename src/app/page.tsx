'use client'

import { AlertDisplay } from '@/components/AlertDisplay'
import { DeterrentControls } from '@/components/DeterrentControls'
import { Toaster } from 'sonner'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <Toaster />
      <h1 className="text-4xl font-bold mb-8">Penguin Deterrence System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <AlertDisplay />
        </section>
        <section>
          <DeterrentControls />
        </section>
      </div>
    </main>
  )
} 