import './globals.css'
import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Penguin Deterrence System',
  description: 'Real-time penguin detection and deterrence system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <header className="flex justify-end items-center p-4 gap-4 h-16 bg-white border-b">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </header>
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
} 