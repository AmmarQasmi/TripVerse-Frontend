import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      clearSession: () => set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      }),
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
      skipHydration: true,
    }
  )
)
