import { User } from '@/types'

const AUTH_TOKEN_KEY = 'auth_token'
const USER_DATA_KEY = 'user_data'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getUserData(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem(USER_DATA_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

export function setUserData(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
}

export function removeUserData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_DATA_KEY)
}

export function clearAuthSession(): void {
  removeAuthToken()
  removeUserData()
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export function hasRole(role: string): boolean {
  const user = getUserData()
  return user?.role === role
}

export function hasAnyRole(roles: string[]): boolean {
  const user = getUserData()
  return user ? roles.includes(user.role) : false
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}

export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return new Date(payload.exp * 1000)
  } catch (error) {
    return null
  }
}
