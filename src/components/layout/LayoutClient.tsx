'use client'

import { useState } from 'react'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { cn } from '@/lib/utils'

export function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-background">
        <div className="fixed inset-y-0 z-50">
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            setIsCollapsed={setSidebarCollapsed} 
          />
        </div>
        <main className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[240px]"
        )}>
          <div className="container mx-auto py-4 px-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster theme="dark" />
    </WebSocketProvider>
  )
} 