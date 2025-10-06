import { create } from 'zustand'

interface SearchFilters {
  query?: string
  location?: string
  dateRange?: {
    startDate: string
    endDate: string
  }
  priceRange?: {
    min: number
    max: number
  }
  amenities?: string[]
  type?: string
}

interface SearchState {
  hotelFilters: SearchFilters
  carFilters: SearchFilters
  setHotelFilters: (filters: Partial<SearchFilters>) => void
  setCarFilters: (filters: Partial<SearchFilters>) => void
  clearHotelFilters: () => void
  clearCarFilters: () => void
  clearAllFilters: () => void
}

const defaultFilters: SearchFilters = {
  query: '',
  location: '',
  dateRange: undefined,
  priceRange: undefined,
  amenities: [],
  type: '',
}

export const useSearchStore = create<SearchState>((set) => ({
  hotelFilters: defaultFilters,
  carFilters: defaultFilters,
  
  setHotelFilters: (filters) =>
    set((state) => ({
      hotelFilters: { ...state.hotelFilters, ...filters },
    })),
  
  setCarFilters: (filters) =>
    set((state) => ({
      carFilters: { ...state.carFilters, ...filters },
    })),
  
  clearHotelFilters: () =>
    set({ hotelFilters: defaultFilters }),
  
  clearCarFilters: () =>
    set({ carFilters: defaultFilters }),
  
  clearAllFilters: () =>
    set({
      hotelFilters: defaultFilters,
      carFilters: defaultFilters,
    }),
}))
