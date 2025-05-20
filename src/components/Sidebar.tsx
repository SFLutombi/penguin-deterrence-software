'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BarChart2, 
  FileAudio, 
  Settings,
  Mic
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Statistics',
    href: '/stats',
    icon: BarChart2
  },
  {
    name: 'Recordings',
    href: '/recordings',
    icon: FileAudio
  },
  {
    name: 'Microphones',
    href: '/microphones',
    icon: Mic
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Penguin Deterrence</h1>
      </div>
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
} 