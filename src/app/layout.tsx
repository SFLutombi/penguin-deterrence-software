import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ClerkProvider } from '@clerk/nextjs'
import { LayoutClient } from '@/components/layout/LayoutClient'

export const metadata: Metadata = {
  title: 'Penguin Deterrence System',
  description: 'Monitor and control penguin activity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={GeistSans.className}>
          <LayoutClient>
            {children}
          </LayoutClient>
        </body>
      </html>
    </ClerkProvider>
  )
} 