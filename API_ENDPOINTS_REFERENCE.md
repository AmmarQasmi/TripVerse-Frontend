# 🔌 API Endpoints Reference

## 📍 Backend Base URL
- **Local Development**: `http://localhost:8000`
- **Production**: Set in `.env.local` as `NEXT_PUBLIC_API_URL`

---

## ✅ **Integrated Endpoints**

All endpoints below are already configured and ready to use in your Next.js frontend!

### 🔐 **Authentication** (`authApi`)

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/auth/signup` | `authApi.signup(data)` | Register new user |
| POST | `/auth/login` | `authApi.login(credentials)` | Login user |
| GET | `/auth/me` | `authApi.getMe()` | Get current authenticated user |
| GET | `/auth/me` | `authApi.getProfile()` | Get current user profile (alias) |
| POST | `/auth/logout` | `authApi.logout()` | Logout current user |
| POST | `/auth/refresh` | `authApi.refreshToken()` | Refresh access token |

**Helper Functions:**
- `authApi.getCurrentUser()` - Get user from localStorage (no API call)
- `authApi.isAuthenticated()` - Check if user is authenticated (no API call)

---

### 🌆 **Cities** (`cityApi`)

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/cities` | `cityApi.getCities()` | Get all cities |
| GET | `/cities/regions` | `cityApi.getRegions()` | Get all unique regions |
| GET | `/cities/:id` | `cityApi.getCityById(id)` | Get city by ID |

---

### 🚗 **Drivers** (`driverApi`)

| Method | Endpoint | Function | Description | Auth Required |
|--------|----------|----------|-------------|---------------|
| GET | `/drivers/profile` | `driverApi.getProfile()` | Get driver profile | ✅ Yes (Driver) |

---

### 👨‍💼 **Admin** (`adminApi`)

| Method | Endpoint | Function | Description | Auth Required |
|--------|----------|----------|-------------|---------------|
| GET | `/admin/dashboard` | `adminApi.getDashboard()` | Get admin dashboard data | ✅ Yes (Admin) |

---

## 📝 **Usage Examples**

### **1. User Signup**

```tsx
'use client'

import { authApi } from '@/lib/api/auth.api'
import { RegisterData } from '@/types'

export default function SignupPage() {
  const handleSignup = async () => {
    try {
      const data: RegisterData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'client',
        city_id: 1
      }
      
      const response = await authApi.signup(data)
      console.log('Signed up user:', response.user)
      console.log('Token:', response.access_token)
      // Token is automatically stored in localStorage
      
    } catch (error: any) {
      console.error('Signup failed:', error.response?.data?.message)
    }
  }

  return (/* JSX */)
}
```

### **2. User Login**

```tsx
import { authApi } from '@/lib/api/auth.api'

const handleLogin = async () => {
  try {
    const response = await authApi.login({
      email: 'john@example.com',
      password: 'password123'
    })
    
    console.log('Logged in user:', response.user)
    // Token is automatically stored
    
    // Redirect based on role
    if (response.user.role === 'driver') {
      router.push('/driver/dashboard')
    } else if (response.user.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/client/dashboard')
    }
  } catch (error: any) {
    console.error('Login failed:', error.response?.data?.message)
  }
}
```

### **3. Get Current User**

```tsx
import { authApi } from '@/lib/api/auth.api'

// Option 1: From API (requires token, makes HTTP request)
const user = await authApi.getMe()

// Option 2: From localStorage (no HTTP request)
const user = authApi.getCurrentUser()

// Option 3: Check if authenticated
if (authApi.isAuthenticated()) {
  console.log('User is logged in!')
}
```

### **4. Fetch Cities and Regions**

```tsx
import { cityApi } from '@/lib/api/auth.api'

const loadCitiesAndRegions = async () => {
  try {
    // Get all cities
    const cities = await cityApi.getCities()
    console.log('Cities:', cities)
    
    // Get all regions
    const regions = await cityApi.getRegions()
    console.log('Regions:', regions)
    
    // Get specific city
    const city = await cityApi.getCityById(1)
    console.log('City:', city)
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}
```

### **5. Driver Profile**

```tsx
import { driverApi } from '@/lib/api/auth.api'

// Must be authenticated as driver
const DriverProfilePage = () => {
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await driverApi.getProfile()
        console.log('Driver profile:', profile)
      } catch (error: any) {
        console.error('Failed to load profile:', error.response?.data?.message)
      }
    }
    loadProfile()
  }, [])

  return (/* JSX */)
}
```

### **6. Admin Dashboard**

```tsx
import { adminApi } from '@/lib/api/auth.api'

// Must be authenticated as admin
const AdminDashboardPage = () => {
  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardData = await adminApi.getDashboard()
        console.log('Dashboard data:', dashboardData)
      } catch (error: any) {
        if (error.response?.status === 403) {
          console.error('Access denied: Admin role required')
        }
      }
    }
    loadDashboard()
  }, [])

  return (/* JSX */)
}
```

### **7. Logout**

```tsx
import { authApi } from '@/lib/api/auth.api'

const handleLogout = async () => {
  try {
    await authApi.logout()
    // Token and user data automatically cleared from localStorage
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
```

---

## 🔒 **Authentication & Authorization**

### **How Authentication Works:**

1. **Login/Signup** → Backend returns `access_token`
2. **Token Storage** → Automatically stored in `localStorage`
3. **HTTP Interceptor** → Automatically adds `Authorization: Bearer <token>` to all requests
4. **Protected Routes** → Backend validates token and role
5. **401 Error** → Automatically redirects to `/auth/login` and clears tokens

### **Protected Endpoint Flow:**

```typescript
// Frontend makes request
const profile = await driverApi.getProfile()
     ↓
// HTTP interceptor adds header automatically
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ↓
// Backend validates token
// - If valid: Returns data
// - If invalid/expired: Returns 401
     ↓
// 401 interceptor triggers
// - Clears localStorage
// - Redirects to /auth/login
```

### **Role-Based Access:**

```tsx
import { authApi } from '@/lib/api/auth.api'

const user = authApi.getCurrentUser()

if (user?.role === 'admin') {
  // Show admin features
  const dashboard = await adminApi.getDashboard()
} else if (user?.role === 'driver') {
  // Show driver features
  const profile = await driverApi.getProfile()
} else {
  // Show client features
}
```

---

## 🎯 **API Response Types**

### **Auth Response**

```typescript
interface AuthResponse {
  access_token: string
  user: {
    id: number
    email: string
    full_name: string
    role: 'client' | 'driver' | 'admin'
    status: string
    city: {
      id: number
      name: string
      region: string
    }
  }
}
```

### **User Type**

```typescript
interface User {
  id: number
  email: string
  full_name: string
  role: 'client' | 'driver' | 'admin'
  status: string
  city: {
    id: number
    name: string
    region: string
  }
}
```

### **City Type**

```typescript
interface City {
  id: number
  name: string
  region: string
}
```

---

## 🐛 **Error Handling**

### **Standard Pattern:**

```tsx
try {
  const data = await authApi.login(credentials)
  // Success
} catch (error: any) {
  // Extract error message
  const message = error.response?.data?.message 
    || error.message 
    || 'An error occurred'
  
  // Check status code
  if (error.response?.status === 401) {
    console.error('Unauthorized')
  } else if (error.response?.status === 403) {
    console.error('Forbidden: Insufficient permissions')
  } else if (error.response?.status === 404) {
    console.error('Not found')
  }
  
  // Show error to user
  setError(message)
}
```

### **Common Status Codes:**

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions (wrong role) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

---

## 📦 **TypeScript Types Location**

All types are defined in:
- `src/types/api.d.ts` - API types (User, City, AuthResponse, etc.)
- `src/types/index.d.ts` - General types

Import them like:
```typescript
import { User, City, RegisterData, AuthResponse } from '@/types'
```

---

## 🚀 **Quick Start Checklist**

- ✅ Backend running on `http://localhost:8000`
- ✅ Frontend running on `http://localhost:3000`
- ✅ `.env.local` created with `NEXT_PUBLIC_API_URL=http://localhost:8000`
- ✅ CORS enabled on backend for `http://localhost:3000`
- ✅ All endpoints configured in `src/lib/api/endpoints.ts`
- ✅ API functions available in `src/lib/api/auth.api.ts`

---

## 📚 **Available API Modules**

Import and use these APIs in your components:

```typescript
import { 
  authApi,    // Authentication operations
  cityApi,    // City and region data
  driverApi,  // Driver-specific operations (requires auth)
  adminApi    // Admin operations (requires admin role)
} from '@/lib/api/auth.api'
```

---

## 🎉 **You're All Set!**

Your Next.js frontend is now fully integrated with your NestJS backend running on port 8000!

All API calls are:
- ✅ Type-safe with TypeScript
- ✅ Automatically authenticated
- ✅ Error-handled with interceptors
- ✅ Ready to use in any client component

Just import the API functions and call them! 🚀

