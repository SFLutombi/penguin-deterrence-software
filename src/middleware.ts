import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add CORS headers for the WebSocket endpoint
    if (req.nextUrl.pathname.startsWith('/api/esp32')) {
      const response = NextResponse.next()
      response.headers.append('Access-Control-Allow-Origin', '*')
      response.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.append('Access-Control-Allow-Headers', 'Content-Type')
      return response
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login'
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/esp32 (WebSocket endpoint)
     * - /api/auth (NextAuth.js endpoints)
     * - /login (login page)
     * - /_next (Next.js internals)
     * - /static (static files)
     * - /favicon.ico, /site.webmanifest (static files)
     */
    '/((?!api/esp32|api/auth|login|_next|static|favicon.ico|site.webmanifest).*)'
  ]
} 