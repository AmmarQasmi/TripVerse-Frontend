import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  '/client': ['CLIENT', 'ADMIN'],
  '/driver': ['DRIVER', 'ADMIN'],
  '/admin': ['ADMIN'],
}

// Routes that require authentication but no specific role
const authRequiredRoutes = [
  '/client/dashboard',
  '/client/bookings',
  '/driver/dashboard',
  '/driver/cars',
  '/driver/bookings',
  '/driver/payouts',
  '/admin/dashboard',
  '/admin/drivers',
  '/admin/payments',
  '/admin/disputes',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/client/hotels',
  '/client/cars',
  '/client/monuments',
  '/client/weather',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get the auth token from cookies or headers
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // If no token and route requires auth, redirect to login
  if (!token && authRequiredRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If token exists, verify it and check role permissions
  if (token) {
    try {
      // In a real app, you would verify the JWT token here
      // For now, we'll assume the token is valid and extract user info
      // const payload = jwt.verify(token, process.env.JWT_SECRET)
      // const userRole = payload.role
      
      // For demo purposes, we'll check if the user has the right role
      // by looking at the route pattern
      for (const [routePattern, allowedRoles] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(routePattern)) {
          // In a real app, you would check if userRole is in allowedRoles
          // For now, we'll allow access
          return NextResponse.next()
        }
      }
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
