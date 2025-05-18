import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Penguin Deterrence System',
  description: 'A system for detecting and deterring penguins using audio analysis and deterrent devices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 