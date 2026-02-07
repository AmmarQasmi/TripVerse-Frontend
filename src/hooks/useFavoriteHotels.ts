'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/useAuth'

const STORAGE_KEY = 'tripverse_favorite_hotels'

function getFavorites(userId: number): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(userId: number, ids: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(ids))
}

// Global listeners so multiple components stay in sync
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

export function useFavoriteHotels() {
  const { user } = useAuth()
  const userId = user?.id ?? 0
  const [favorites, setFavorites] = useState<string[]>([])

  const refresh = useCallback(() => {
    if (userId) setFavorites(getFavorites(userId))
  }, [userId])

  useEffect(() => {
    refresh()
    listeners.add(refresh)
    return () => { listeners.delete(refresh) }
  }, [refresh])

  const isFavorite = useCallback(
    (hotelId: string) => favorites.includes(hotelId),
    [favorites],
  )

  const toggleFavorite = useCallback(
    (hotelId: string) => {
      if (!userId) return false
      const current = getFavorites(userId)
      let next: string[]
      if (current.includes(hotelId)) {
        next = current.filter((id) => id !== hotelId)
      } else {
        next = [...current, hotelId]
      }
      saveFavorites(userId, next)
      setFavorites(next)
      notifyListeners()
      return next.includes(hotelId)
    },
    [userId],
  )

  return { favorites, isFavorite, toggleFavorite }
}
