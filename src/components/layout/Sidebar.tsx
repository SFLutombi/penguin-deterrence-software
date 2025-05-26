'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronRight, 
  Menu,
  Mic2,
  Bell,
  Settings,
  BarChart2,
  Shield,
  History
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const items = [
    {
      title: 'Dashboard',
      icon: BarChart2,
      href: '/',
    },
    {
      title: 'Detections',
      icon: History,
      href: '/detections',
    },
    {
      title: 'Microphones',
      icon: Mic2,
      href: '/microphones',
    },
    {
      title: 'Alerts',
      icon: Bell,
      href: '/alerts',
    },
    {
      title: 'Deterrents',
      icon: Shield,
      href: '/deterrents',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ]

  return (
    <>
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 bg-[hsl(var(--sidebar-background))]">
          <MobileNav items={items} setIsOpen={setIsMobileOpen} />
        </SheetContent>
      </Sheet>
      <nav
        className={cn(
          "hidden lg:flex flex-col gap-4 p-4 border-r border-[hsl(var(--sidebar-border))] h-screen bg-[hsl(var(--sidebar-background))]",
          isCollapsed && "w-[80px]",
          !isCollapsed && "w-[240px]"
        )}
      >
        {/* Header */}
        <div className="flex h-[60px] items-center justify-between px-2">
          {!isCollapsed && (
            <span className="text-lg font-semibold text-[hsl(var(--sidebar-foreground))]">
              Penguin Guard
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
          >
            <ChevronRight className={cn("h-6 w-6 transition-transform", !isCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 -mx-4">
          <div className="flex flex-col gap-2 px-2">
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                    "text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
                    pathname === item.href && "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.title}</span>}
                </span>
              </Link>
            ))}
          </div>
        </ScrollArea>

        {/* Footer with User Profile */}
        <div className="mt-auto pt-4">
          <Separator className="mb-4 bg-[hsl(var(--sidebar-border))]" />
          <div className={cn(
            "flex items-center gap-2",
            isCollapsed && "justify-center"
          )}>
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton />
                <SignUpButton />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                  }
                }}
              />
              {!isCollapsed && (
                <span className="text-sm text-[hsl(var(--sidebar-foreground))]">Account</span>
              )}
            </SignedIn>
          </div>
        </div>
      </nav>
    </>
  )
}

function MobileNav({ items, setIsOpen }: { items: any[], setIsOpen: (open: boolean) => void }) {
  const pathname = usePathname()
  
  return (
    <ScrollArea className="h-full py-6">
      <div className="flex flex-col gap-4">
        <div className="px-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--sidebar-foreground))]">
            Penguin Guard
          </h2>
        </div>
        <Separator className="bg-[hsl(var(--sidebar-border))]" />
        <div className="flex flex-col gap-2 px-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                "text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
                pathname === item.href && "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
        <div className="mt-auto px-6 pt-4">
          <Separator className="mb-4 bg-[hsl(var(--sidebar-border))]" />
          <div className="flex items-center gap-2">
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton />
                <SignUpButton />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                  }
                }}
              />
              <span className="text-sm text-[hsl(var(--sidebar-foreground))]">Account</span>
            </SignedIn>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
} 