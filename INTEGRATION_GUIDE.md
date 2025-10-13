# 🔗 Next.js + NestJS Integration Guide

## 📚 **Architecture Overview**

Your integration follows the **same pattern as React**, with API logic separated into dedicated modules:

```
src/lib/api/
├── http.ts          → HTTP Client (Axios)
├── endpoints.ts     → Centralized API endpoints
├── auth.api.ts      → Authentication APIs
├── cars.api.ts      → Cars APIs
├── hotels.api.ts    → Hotels APIs
└── ...              → Other feature APIs
```

---

## 🛠️ **Setup Steps**

### **1. Environment Variables**

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# For production: https://your-backend-url.com
```

### **2. File Structure (Already Done!)**

✅ `src/lib/api/http.ts` - HTTP client with interceptors
✅ `src/lib/api/endpoints.ts` - All API endpoints
✅ `src/lib/api/auth.api.ts` - Auth & City APIs
✅ `src/types/api.d.ts` - TypeScript types

---

## 🔥 **How to Use in Next.js Components**

### **Example 1: Signup Page (Already Integrated)**

```tsx
'use client'

import { authApi, cityApi } from '@/lib/api/auth.api'
import { RegisterData, City } from '@/types'

export default function SignupPage() {
  const [cities, setCities] = useState<City[]>([])

  // 1️⃣ Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const citiesData = await cityApi.getCities()
        setCities(citiesData)
      } catch (error) {
        console.error(error)
      }
    }
    loadData()
  }, [])

  // 2️⃣ Call API on form submit
  const handleSignup = async (data: RegisterData) => {
    try {
      const response = await authApi.signup(data)
      // Token is automatically stored!
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed'
      setError(message)
    }
  }

  return (/* Your JSX */)
}
```

---

## 🎯 **Key Patterns**

### **Pattern 1: Simple API Call**

```tsx
// GET request
const cars = await carsApi.getAll()

// POST request
const newCar = await carsApi.create({ brand: 'Toyota', model: 'Camry' })

// PUT request
const updated = await carsApi.update(carId, { price: 50000 })

// DELETE request
await carsApi.delete(carId)
```

### **Pattern 2: With Loading State**

```tsx
const [isLoading, setIsLoading] = useState(false)
const [data, setData] = useState(null)
const [error, setError] = useState(null)

const fetchData = async () => {
  setIsLoading(true)
  setError(null)
  
  try {
    const result = await someApi.getData()
    setData(result)
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

### **Pattern 3: With React Query (Recommended)**

```tsx
import { useQuery, useMutation } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars.api'

// Query
const { data: cars, isLoading, error } = useQuery({
  queryKey: ['cars'],
  queryFn: () => carsApi.getAll()
})

// Mutation
const mutation = useMutation({
  mutationFn: (data: CreateCarData) => carsApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cars'] })
  }
})
```

---

## 🔐 **Authentication Flow**

### **How It Works:**

1. **Signup/Login** → API stores `access_token` & `user` in localStorage
2. **HTTP Client** → Automatically adds `Authorization: Bearer <token>` to all requests
3. **401 Error** → Automatically redirects to `/auth/login` and clears tokens

### **Check Auth Status:**

```tsx
import { authApi } from '@/lib/api/auth.api'

// Check if user is logged in
const isLoggedIn = authApi.isAuthenticated()

// Get current user
const user = authApi.getCurrentUser()

// In a component
useEffect(() => {
  if (!authApi.isAuthenticated()) {
    router.push('/auth/login')
  }
}, [])
```

---

## 🆕 **Creating New API Modules**

### **Step 1: Add Endpoints**

```typescript
// src/lib/api/endpoints.ts
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: number) => `/bookings/${id}`,
    USER: '/bookings/user',
    CANCEL: (id: number) => `/bookings/${id}/cancel`,
  },
}
```

### **Step 2: Define Types**

```typescript
// src/types/api.d.ts
export interface Booking {
  id: number
  userId: number
  carId: number
  startDate: string
  endDate: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface CreateBookingData {
  carId: number
  startDate: string
  endDate: string
}
```

### **Step 3: Create API Module**

```typescript
// src/lib/api/bookings.api.ts
import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Booking, CreateBookingData } from '@/types'

export const bookingsApi = {
  // Get all bookings
  getAll: async (): Promise<Booking[]> => {
    return httpClient.get<Booking[]>(API_ENDPOINTS.BOOKINGS.BASE)
  },

  // Get user's bookings
  getMyBookings: async (): Promise<Booking[]> => {
    return httpClient.get<Booking[]>(API_ENDPOINTS.BOOKINGS.USER)
  },

  // Get booking by ID
  getById: async (id: number): Promise<Booking> => {
    return httpClient.get<Booking>(API_ENDPOINTS.BOOKINGS.BY_ID(id))
  },

  // Create booking
  create: async (data: CreateBookingData): Promise<Booking> => {
    return httpClient.post<Booking>(API_ENDPOINTS.BOOKINGS.BASE, data)
  },

  // Cancel booking
  cancel: async (id: number): Promise<Booking> => {
    return httpClient.post<Booking>(API_ENDPOINTS.BOOKINGS.CANCEL(id))
  },

  // Delete booking
  delete: async (id: number): Promise<void> => {
    return httpClient.delete(API_ENDPOINTS.BOOKINGS.BY_ID(id))
  },
}
```

### **Step 4: Use in Component**

```tsx
'use client'

import { bookingsApi } from '@/lib/api/bookings.api'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await bookingsApi.getMyBookings()
        setBookings(data)
      } catch (error) {
        console.error(error)
      }
    }
    loadBookings()
  }, [])

  return (/* JSX */)
}
```

---

## ⚡ **Key Differences: Next.js vs React**

### **1. Client vs Server Components**

```tsx
// ❌ Server Component (default) - CANNOT use APIs directly
export default async function Page() {
  // This won't work! No localStorage, no hooks
}

// ✅ Client Component - Use 'use client' directive
'use client'
export default function Page() {
  // This works! Can use hooks, localStorage, APIs
}
```

### **2. Data Fetching Options**

| Method | When to Use | Where |
|--------|-------------|-------|
| `useEffect` + API | Simple client-side fetching | Client Components |
| `React Query` | Complex data with caching | Client Components |
| `fetch` in Server | SEO-critical data | Server Components |
| `Route Handlers` | API routes in Next.js | `app/api/` |

### **3. Environment Variables**

- **Client-side**: Must start with `NEXT_PUBLIC_`
- **Server-side**: No prefix needed

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API (accessible in browser)
DATABASE_URL=postgres://...                 # Server-only
```

---

## 🎨 **Best Practices**

### ✅ **DO:**

1. **Use TypeScript** for type safety
2. **Handle errors gracefully** with try-catch
3. **Show loading states** for better UX
4. **Use React Query** for complex data fetching
5. **Keep API logic in `/lib/api`** folder
6. **Use environment variables** for URLs

### ❌ **DON'T:**

1. Don't use `fetch` directly in components
2. Don't hardcode API URLs
3. Don't forget error handling
4. Don't mix API logic with UI logic
5. Don't store sensitive data in localStorage (only tokens)

---

## 🔧 **Common Issues & Solutions**

### **Issue: "window is not defined"**

```tsx
// ❌ Wrong
const token = localStorage.getItem('token')

// ✅ Correct
const token = typeof window !== 'undefined' 
  ? localStorage.getItem('token') 
  : null
```

### **Issue: CORS errors**

Make sure your NestJS backend has CORS enabled:

```typescript
// NestJS main.ts (runs on port 8000)
app.enableCors({
  origin: 'http://localhost:3000', // Your Next.js URL (default port)
  credentials: true,
})
```

### **Issue: 401 Unauthorized**

- Check if token is being sent in headers (Network tab)
- Verify token is stored correctly in localStorage
- Check backend JWT validation

---

## 📖 **Quick Reference**

### **Import Statements**

```tsx
import { authApi, cityApi } from '@/lib/api/auth.api'
import { carsApi } from '@/lib/api/cars.api'
import { hotelsApi } from '@/lib/api/hotels.api'
import { User, Car, Hotel } from '@/types'
```

### **Common API Calls**

```tsx
// Auth
await authApi.login({ email, password })
await authApi.signup(data)
await authApi.logout()
const user = authApi.getCurrentUser()
const isAuth = authApi.isAuthenticated()

// Cities
const cities = await cityApi.getCities()
const regions = await cityApi.getRegions()

// Cars (example pattern)
const cars = await carsApi.getAll()
const car = await carsApi.getById(id)
const newCar = await carsApi.create(data)
await carsApi.update(id, data)
await carsApi.delete(id)
```

---

## 🎓 **Summary**

Your Next.js + NestJS integration is **exactly like React**:

1. **API Client** (`http.ts`) → Handles requests with Axios
2. **Endpoints** (`endpoints.ts`) → Centralized URL definitions
3. **API Modules** (`*.api.ts`) → Feature-specific API functions
4. **Types** (`types/`) → TypeScript interfaces
5. **Components** → Import and call API functions

The only difference is using `'use client'` directive for components that use hooks and browser APIs!

---

## 🚀 **Next Steps**

1. ✅ Create `.env.local` with your backend URL
2. ✅ Test signup page (already integrated!)
3. ✅ Update login page with similar pattern
4. ✅ Create more API modules as needed
5. ✅ Consider adding React Query for better data management

Happy coding! 🎉

