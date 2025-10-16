# Authentication Usage Examples

This document shows how to implement authentication in different scenarios.

---

## ✅ **Scenario 1: Public Pages (Hotels List, Home, etc.)**

**No protection needed - anyone can view:**

```tsx
// src/app/hotels/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'

export default function HotelsPage() {
  const { user } = useAuth() // Optional - just to show user info if logged in
  const [hotels, setHotels] = useState([])

  useEffect(() => {
    // Fetch hotels - NO authentication required
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    const response = await fetch('http://localhost:8000/hotels')
    const data = await response.json()
    setHotels(data)
  }

  return (
    <div>
      <h1>Hotels</h1>
      
      {/* Show user greeting if logged in */}
      {user && <p>Welcome back, {user.full_name}!</p>}
      
      {/* Hotels list - visible to everyone */}
      {hotels.map(hotel => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  )
}
```

---

## 🔒 **Scenario 2: Require Login for Specific Action (Booking)**

**Page is public, but booking requires login:**

```tsx
// src/app/hotels/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function HotelDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, requireAuth } = useRequireAuth()
  const [hotel, setHotel] = useState(null)

  // Anyone can view hotel details
  useEffect(() => {
    fetchHotelDetails(params.id)
  }, [params.id])

  const handleBookNow = () => {
    // Check authentication before allowing booking
    if (!requireAuth()) {
      // User will be redirected to login
      // After login, they'll come back to this page
      return
    }

    // User is authenticated, proceed to booking
    router.push(`/hotels/${params.id}/booking`)
  }

  return (
    <div>
      <h1>{hotel?.name}</h1>
      <p>{hotel?.description}</p>
      
      {/* Anyone can see this button */}
      <button onClick={handleBookNow}>
        {user ? 'Book Now' : 'Login to Book'}
      </button>
    </div>
  )
}
```

---

## 🔐 **Scenario 3: Protected Page (Booking Confirmation)**

**Entire page requires authentication:**

```tsx
// src/app/hotels/[id]/booking/page.tsx
'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function BookingPage({ params }: { params: { id: string } }) {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
  })

  const handleConfirmBooking = async () => {
    // User is guaranteed to be authenticated here
    const response = await fetch('http://localhost:8000/bookings', {
      method: 'POST',
      body: JSON.stringify({
        hotelId: params.id,
        ...bookingData,
      }),
    })
    
    // Handle success
  }

  return (
    <div>
      <h1>Complete Your Booking</h1>
      
      {/* Booking form */}
      <form onSubmit={handleConfirmBooking}>
        {/* ... form fields ... */}
      </form>
    </div>
  )
}

// Wrap with ProtectedRoute
export default function ProtectedBookingPage(props: any) {
  return (
    <ProtectedRoute>
      <BookingPage {...props} />
    </ProtectedRoute>
  )
}
```

---

## 👤 **Scenario 4: Role-Based Protection (Driver Dashboard)**

**Only drivers can access:**

```tsx
// src/app/driver/dashboard/page.tsx
'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/features/auth/useAuth'

function DriverDashboardContent() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Driver Dashboard</h1>
      <p>Welcome, {user?.full_name}</p>
      
      {/* Driver-specific content */}
      <div>Your earnings: $1,234</div>
      <div>Active bookings: 5</div>
    </div>
  )
}

export default function DriverDashboard() {
  return (
    <ProtectedRoute requiredRole="driver">
      <DriverDashboardContent />
    </ProtectedRoute>
  )
}
```

---

## 🎯 **Scenario 5: Conditional Rendering (Navbar)**

**Show different nav items based on auth status:**

```tsx
// src/components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/features/auth/useAuth'

export function Navbar() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <nav>Loading...</nav>
  }

  return (
    <nav>
      {/* Public links - always visible */}
      <Link href="/">Home</Link>
      <Link href="/hotels">Hotels</Link>
      <Link href="/cars">Cars</Link>
      
      {/* Conditional links based on auth */}
      {user ? (
        <>
          {/* Logged in */}
          <Link href="/client/dashboard">Dashboard</Link>
          <Link href="/client/bookings">My Bookings</Link>
          <button onClick={() => logout()}>Logout</button>
          <span>Hi, {user.full_name}</span>
        </>
      ) : (
        <>
          {/* Not logged in */}
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/signup">Sign Up</Link>
        </>
      )}
    </nav>
  )
}
```

---

## 🛒 **Scenario 6: Checkout Flow (Multi-Step with Auth)**

**Public until payment step:**

```tsx
// src/app/checkout/page.tsx
'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function CheckoutPage() {
  const { requireAuth, isAuthenticated } = useRequireAuth()
  const [step, setStep] = useState(1)

  const handleProceedToPayment = () => {
    // Require auth before payment
    if (!requireAuth()) return
    
    // User is authenticated, proceed to payment
    setStep(3)
  }

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Select Dates</h2>
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2>Review Booking</h2>
          <button onClick={handleProceedToPayment}>
            {isAuthenticated() ? 'Proceed to Payment' : 'Login to Continue'}
          </button>
        </div>
      )}
      
      {step === 3 && isAuthenticated() && (
        <div>
          <h2>Payment</h2>
          {/* Payment form - user is guaranteed to be authenticated */}
        </div>
      )}
    </div>
  )
}
```

---

## 📱 **Scenario 7: API Calls with Optional Auth**

**Some endpoints require auth, some don't:**

```tsx
// src/lib/api/hotels.api.ts
import { httpClient } from './http'

export const hotelsApi = {
  // Public endpoint - NO auth required
  getHotels: async (params: any) => {
    return httpClient.get('/hotels', { params })
  },

  // Public endpoint - NO auth required
  getHotelDetails: async (id: string) => {
    return httpClient.get(`/hotels/${id}`)
  },

  // Protected endpoint - auth required (cookie sent automatically)
  createBooking: async (data: any) => {
    try {
      return await httpClient.post('/bookings', data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please login to complete booking')
      }
      throw error
    }
  },

  // Protected endpoint - auth required
  getUserBookings: async () => {
    return httpClient.get('/bookings/user')
  },
}
```

---

## 🎨 **Best Practices**

### ✅ DO:
- Use `ProtectedRoute` for entire pages that require auth (dashboards, bookings)
- Use `useRequireAuth()` hook for specific actions (book now, add to favorites)
- Let users browse publicly and require login only when needed
- Show "Login to continue" messages instead of hiding features

### ❌ DON'T:
- Don't protect public pages (home, search, details)
- Don't auto-redirect on 401 globally (let pages handle it)
- Don't require login for browsing
- Don't check auth on every component (only where needed)

---

## 🔄 **User Flow Example**

```
1. User visits /hotels (public)
   ✅ Shows all hotels

2. User clicks hotel card → /hotels/123 (public)
   ✅ Shows hotel details
   ✅ Shows "Book Now" button

3. User clicks "Book Now"
   ❓ Check if logged in
   
   IF NOT LOGGED IN:
   → Redirect to /auth/login?redirect=/hotels/123/booking
   → User logs in
   → Redirect back to /hotels/123/booking
   
   IF LOGGED IN:
   → Go directly to /hotels/123/booking

4. Booking page (protected)
   ✅ Only accessible to logged-in users
   ✅ User completes booking
   ✅ Cookie is sent with API request automatically

5. After booking → /client/bookings (protected)
   ✅ Shows user's bookings
```

---

## 🧪 **Testing Checklist**

```bash
# Test public browsing
[ ] Can view /hotels without login
[ ] Can view /hotels/123 without login
[ ] Can view /cars without login

# Test protected actions
[ ] Clicking "Book Now" prompts login if not authenticated
[ ] After login, redirected back to booking page
[ ] Booking page only accessible when logged in

# Test protected pages
[ ] /client/dashboard redirects to login if not authenticated
[ ] /driver/dashboard only accessible to drivers
[ ] /admin/dashboard only accessible to admins

# Test persistence
[ ] After refresh, still logged in
[ ] Can navigate between pages without re-login
[ ] Logout clears session properly
```

---

Your app now supports:
✅ Public browsing without login
✅ Optional login prompts at specific actions
✅ Protected pages/routes
✅ Role-based access control
✅ Redirect back after login
✅ No infinite loops!

