'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { FlightSearchForm } from '@/components/flights/FlightSearchForm'
import { PopularRoutesCarousel } from '@/components/flights/PopularRoutesCarousel'
import { FlightCard } from '@/components/flights/FlightCard'
import { FlightFilters } from '@/components/flights/FlightFilters'
import { FlightDetailsModal } from '@/components/flights/FlightDetailsModal'
import { AirportDetailsModal } from '@/components/flights/AirportDetailsModal'
import { AirportMapModal } from '@/components/flights/AirportMapModal'
import { Plane } from 'lucide-react'
import { flightsApi } from '@/lib/api/flights.api'
import { FlightSearchParams } from '@/types'
import { useAuth } from '@/features/auth/useAuth'

// Mock flight data with Pakistani airlines
const mockFlights = [
  {
    id: '1',
    flightNumber: 'PK-306',
    airlineCode: 'PK',
    airlineName: 'Pakistan International Airlines',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    departureTime: '2024-01-15T08:30:00Z',
    arrivalTime: '2024-01-15T10:45:00Z',
    duration: 135, // 2h 15m
    baseFare: 65000,
    taxes: 8500,
    totalFare: 73500,
    currency: 'PKR',
    availableSeats: 12,
    cabinClass: 'ECONOMY' as const,
    aircraft: 'Boeing 777-200LR',
    stops: 0,
    baggage: {
      cabin: { pieces: 1, weight: 7 },
      checked: { pieces: 1, weight: 23, included: true }
    },
    provider: {
      id: 'pia',
      name: 'Pakistan International Airlines',
      logo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop',
      rating: 4.2,
      isPlatformPartner: true,
      commissionRate: 5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    flightNumber: 'SV-703',
    airlineCode: 'SV',
    airlineName: 'Saudia',
    origin: { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan' },
    destination: { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
    departureTime: '2024-01-15T14:20:00Z',
    arrivalTime: '2024-01-15T16:35:00Z',
    duration: 135, // 2h 15m
    baseFare: 72000,
    taxes: 9200,
    totalFare: 81200,
    currency: 'PKR',
    availableSeats: 8,
    cabinClass: 'ECONOMY' as const,
    aircraft: 'Airbus A320',
    stops: 0,
    baggage: {
      cabin: { pieces: 1, weight: 7 },
      checked: { pieces: 1, weight: 23, included: true }
    },
    provider: {
      id: 'saudia',
      name: 'Saudia',
      logo: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop',
      rating: 4.5,
      isPlatformPartner: true,
      commissionRate: 5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    flightNumber: 'EK-602',
    airlineCode: 'EK',
    airlineName: 'Emirates',
    origin: { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
    destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    departureTime: '2024-01-15T11:15:00Z',
    arrivalTime: '2024-01-15T13:30:00Z',
    duration: 135, // 2h 15m
    baseFare: 85000,
    taxes: 11500,
    totalFare: 96500,
    currency: 'PKR',
    availableSeats: 15,
    cabinClass: 'ECONOMY' as const,
    aircraft: 'Boeing 777-300ER',
    stops: 0,
    baggage: {
      cabin: { pieces: 1, weight: 7 },
      checked: { pieces: 1, weight: 23, included: true }
    },
    provider: {
      id: 'emirates',
      name: 'Emirates',
      logo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=100&h=100&fit=crop',
      rating: 4.8,
      isPlatformPartner: true,
      commissionRate: 5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    flightNumber: 'PA-201',
    airlineCode: 'PA',
    airlineName: 'Air Blue',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    departureTime: '2024-01-15T23:45:00Z',
    arrivalTime: '2024-01-16T06:30:00Z',
    duration: 525, // 8h 45m
    baseFare: 185000,
    taxes: 25000,
    totalFare: 210000,
    currency: 'PKR',
    availableSeats: 5,
    cabinClass: 'ECONOMY' as const,
    aircraft: 'Airbus A330-200',
    stops: 0,
    baggage: {
      cabin: { pieces: 1, weight: 7 },
      checked: { pieces: 1, weight: 23, included: true }
    },
    provider: {
      id: 'airblue',
      name: 'Air Blue',
      logo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=100&h=100&fit=crop',
      rating: 4.3,
      isPlatformPartner: true,
      commissionRate: 5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const cityImages: Record<string, string> = {
  Karachi: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
  Lahore: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=300&fit=crop',
  Islamabad: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&h=300&fit=crop',
  Hyderabad: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
  Sukkur: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop',
  Nawabshah: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop',
  Jacobabad: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  Larkana: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  'Mirpur Khas': 'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?w=400&h=300&fit=crop',
  Dadu: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=300&fit=crop',
  Faisalabad: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
  Multan: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  Sialkot: 'https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=400&h=300&fit=crop',
  Bahawalpur: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400&h=300&fit=crop',
  'Dera Ghazi Khan': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  Sargodha: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
  'Rahim Yar Khan': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop',
  Peshawar: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
  Bannu: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400&h=300&fit=crop',
  Chitral: 'https://images.unsplash.com/photo-1464823063530-08f10ed1a2dd?w=400&h=300&fit=crop',
  'Dera Ismail Khan': 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=400&h=300&fit=crop',
  Parachinar: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop',
  Swat: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop',
  Quetta: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop',
  Gwadar: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&h=300&fit=crop',
  Turbat: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop',
  Zhob: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=300&fit=crop',
  Panjgur: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=400&h=300&fit=crop',
  Dalbandin: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=400&h=300&fit=crop',
  Pasni: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=300&fit=crop',
  Ormara: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=300&fit=crop',
  Skardu: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  Gilgit: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  Chilas: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400&h=300&fit=crop'
}

const pakistanAirports = [
  { airport: 'Jinnah International Airport', city: 'Karachi', province: 'Sindh', code: 'KHI', type: 'International' },
  { airport: 'Hyderabad Airport', city: 'Hyderabad', province: 'Sindh', code: 'HDD', type: 'Domestic' },
  { airport: 'Sukkur Airport', city: 'Sukkur', province: 'Sindh', code: 'SKZ', type: 'Domestic' },
  { airport: 'Shaheed Benazirabad Airport', city: 'Nawabshah', province: 'Sindh', code: 'WNS', type: 'Domestic' },
  { airport: 'Jacobabad Airport', city: 'Jacobabad', province: 'Sindh', code: 'JAG', type: 'Domestic' },
  { airport: 'Moenjodaro Airport', city: 'Larkana', province: 'Sindh', code: 'LRG', type: 'Domestic' },
  { airport: 'Mirpur Khas Airport', city: 'Mirpur Khas', province: 'Sindh', code: 'MPD', type: 'Domestic' },
  { airport: 'Dadu Airport', city: 'Dadu', province: 'Sindh', code: 'DDU', type: 'Domestic' },
  { airport: 'Allama Iqbal International Airport', city: 'Lahore', province: 'Punjab', code: 'LHE', type: 'International' },
  { airport: 'Faisalabad International Airport', city: 'Faisalabad', province: 'Punjab', code: 'LYP', type: 'International' },
  { airport: 'Multan International Airport', city: 'Multan', province: 'Punjab', code: 'MUX', type: 'International' },
  { airport: 'Sialkot International Airport', city: 'Sialkot', province: 'Punjab', code: 'SKT', type: 'International' },
  { airport: 'Bahawalpur Airport', city: 'Bahawalpur', province: 'Punjab', code: 'BHV', type: 'Domestic' },
  { airport: 'Dera Ghazi Khan Airport', city: 'Dera Ghazi Khan', province: 'Punjab', code: 'DEA', type: 'Domestic' },
  { airport: 'Bhagatanwala Airport', city: 'Sargodha', province: 'Punjab', code: 'SGI', type: 'Domestic' },
  { airport: 'Sheikh Zayed International Airport', city: 'Rahim Yar Khan', province: 'Punjab', code: 'RYK', type: 'International' },
  { airport: 'Bacha Khan International Airport', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', code: 'PEW', type: 'International' },
  { airport: 'Bannu Airport', city: 'Bannu', province: 'Khyber Pakhtunkhwa', code: 'BNP', type: 'Domestic' },
  { airport: 'Chitral Airport', city: 'Chitral', province: 'Khyber Pakhtunkhwa', code: 'CJL', type: 'Domestic' },
  { airport: 'Dera Ismail Khan Airport', city: 'Dera Ismail Khan', province: 'Khyber Pakhtunkhwa', code: 'DIK', type: 'Domestic' },
  { airport: 'Parachinar Airport', city: 'Parachinar', province: 'Khyber Pakhtunkhwa', code: 'PAJ', type: 'Domestic' },
  { airport: 'Saidu Sharif Airport', city: 'Swat', province: 'Khyber Pakhtunkhwa', code: 'SDT', type: 'Domestic' },
  { airport: 'Quetta International Airport', city: 'Quetta', province: 'Balochistan', code: 'UET', type: 'International' },
  { airport: 'Gwadar International Airport', city: 'Gwadar', province: 'Balochistan', code: 'GWD', type: 'International' },
  { airport: 'Turbat International Airport', city: 'Turbat', province: 'Balochistan', code: 'TUK', type: 'International' },
  { airport: 'Zhob Airport', city: 'Zhob', province: 'Balochistan', code: 'PZH', type: 'Domestic' },
  { airport: 'Panjgur Airport', city: 'Panjgur', province: 'Balochistan', code: 'PJG', type: 'Domestic' },
  { airport: 'Dalbandin Airport', city: 'Dalbandin', province: 'Balochistan', code: 'DBA', type: 'Domestic' },
  { airport: 'Pasni Airport', city: 'Pasni', province: 'Balochistan', code: 'PSI', type: 'Domestic' },
  { airport: 'Ormara Airport', city: 'Ormara', province: 'Balochistan', code: 'ORW', type: 'Domestic' },
  { airport: 'Skardu International Airport', city: 'Skardu', province: 'Gilgit-Baltistan', code: 'KDU', type: 'International' },
  { airport: 'Gilgit Airport', city: 'Gilgit', province: 'Gilgit-Baltistan', code: 'GIL', type: 'Domestic' },
  { airport: 'Chilas Airport', city: 'Chilas', province: 'Gilgit-Baltistan', code: 'CHB', type: 'Domestic' },
  { airport: 'Islamabad International Airport', city: 'Islamabad', province: 'Islamabad Capital Territory', code: 'ISB', type: 'International' }
] as const

const formatAirportLabel = (name: string) =>
  name.replace('International Airport', 'Intl').replace('Airport', '').trim()

const mockPopularRoutes = pakistanAirports.map((airport, index) => ({
  id: `airport-${index + 1}`,
  origin: {
    code: airport.code,
    name: `${airport.city} City`,
    city: airport.city,
    country: 'Pakistan'
  },
  destination: {
    code: airport.code,
    name: airport.airport,
    city: formatAirportLabel(airport.airport),
    country: airport.province
  },
  startingPrice: 8500 + (index % 8) * 1700,
  currency: 'PKR',
  image: cityImages[airport.city] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop',
  airlineLogos: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=50&h=50&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop'
  ],
  isPopular: true,
  discount: 5 + (index % 8),
  airportType: airport.type
}))

const airportProvinceFilters = [
  { label: 'All', value: 'All' },
  { label: 'Sindh', value: 'Sindh' },
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Khyber Pakhtunkhwa (KPK)', value: 'Khyber Pakhtunkhwa' },
  { label: 'Balochistan', value: 'Balochistan' },
  { label: 'Gilgit-Baltistan', value: 'Gilgit-Baltistan' },
  { label: 'Islamabad Capital Territory', value: 'Islamabad Capital Territory' },
] as const

export default function FlightsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAirportData, setSelectedAirportData] = useState<any>(null)
  const [mapAirport, setMapAirport] = useState<any>(null)
  const [selectedAirportProvince, setSelectedAirportProvince] = useState<string>('All')
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const [formInitialParams, setFormInitialParams] = useState<{
    origin?: string
    destination?: string
    departureDate?: string
    returnDate?: string
    travelers?: number
  } | null>(null)

  // Read URL params immediately on mount (before auth check)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const from = urlParams.get('from')
      const to = urlParams.get('to')
      const departure = urlParams.get('departure')
      const returnDate = urlParams.get('return')
      const travelers = urlParams.get('travelers')

      if (from || to || departure) {
        setFormInitialParams({
          origin: from || '',
          destination: to || '',
          departureDate: departure || '',
          returnDate: returnDate || '',
          travelers: travelers ? parseInt(travelers, 10) : 1,
        })
        
        const params: FlightSearchParams = {
          origin: (from || '').toUpperCase().trim(),
          destination: (to || '').toUpperCase().trim(),
          departure_date: departure || '',
          return_date: returnDate || undefined,
          adults: parseInt(travelers || '1', 10),
          children: 0,
          infants: 0,
          cabin_class: 'economy',
        }
        setSearchParams(params)
        setHasSearched(true)
      }
    }
  }, [])

  // Check authentication and restore cached data on mount
  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (!user) {
      // User not authenticated - redirect to login with current URL as redirect
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    // User is authenticated - proceed with restoring cached data
    if (typeof window !== 'undefined' && !hasCheckedAuth) {
      setHasCheckedAuth(true)
      
      // First, try to get data from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const from = urlParams.get('from')
      const to = urlParams.get('to')
      const departure = urlParams.get('departure')
      const returnDate = urlParams.get('return')
      const travelers = urlParams.get('travelers')

      if (from || to || departure) {
        // Use URL params if available
        const params: FlightSearchParams = {
          origin: (from || '').toUpperCase().trim(),
          destination: (to || '').toUpperCase().trim(),
          departure_date: departure || '',
          return_date: returnDate || undefined,
          adults: parseInt(travelers || '1', 10),
          children: 0,
          infants: 0,
          cabin_class: 'economy',
        }
        setSearchParams(params)
        setHasSearched(true)
      } else {
        // Try to restore from cache
        const cachedData = localStorage.getItem('cached_flight_search')
        if (cachedData) {
          try {
            const cached = JSON.parse(cachedData)
            if (cached.from && cached.to && cached.departure) {
              const params: FlightSearchParams = {
                origin: cached.from.toUpperCase().trim(),
                destination: cached.to.toUpperCase().trim(),
                departure_date: cached.departure,
                return_date: cached.return || undefined,
                adults: parseInt(cached.travelers || '1', 10),
                children: 0,
                infants: 0,
                cabin_class: 'economy',
              }
              setSearchParams(params)
              setHasSearched(true)
              
              // Update URL to reflect cached data
              const newParams = new URLSearchParams()
              if (cached.from) newParams.set('from', cached.from)
              if (cached.to) newParams.set('to', cached.to)
              if (cached.departure) newParams.set('departure', cached.departure)
              if (cached.return) newParams.set('return', cached.return)
              if (cached.travelers) newParams.set('travelers', cached.travelers)
              window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
            }
          } catch (error) {
            console.error('Error parsing cached flight search data:', error)
          }
        }
      }
    }
  }, [user, authLoading, router, hasCheckedAuth])

  // Query for flight search
  const { data: flightResults, isLoading, error } = useQuery({
    queryKey: ['flights', searchParams],
    queryFn: () => flightsApi.search(searchParams!),
    enabled: !!searchParams && hasSearched && !!searchParams.origin && !!searchParams.destination && !!searchParams.departure_date,
  })

  const filteredPopularRoutes = useMemo(() => {
    if (selectedAirportProvince === 'All') {
      return mockPopularRoutes
    }
    return mockPopularRoutes.filter((route) => route.destination.country === selectedAirportProvince)
  }, [selectedAirportProvince])

  const handleFlightSelect = (flight: any) => {
    setSelectedFlight(flight)
    setShowDetailsModal(true)
  }

  const handleSearch = (params: any) => {
    // Convert form params to API format
    const cabinClassMap: Record<string, string> = {
      'ECONOMY': 'economy',
      'PREMIUM_ECONOMY': 'premium_economy',
      'BUSINESS': 'business',
      'FIRST': 'first',
    }
    
    // Origin and destination should already be airport codes from the form
    const origin = params.origin.toUpperCase().trim()
    const destination = params.destination.toUpperCase().trim()
    
    // Validate airport codes (3-letter IATA codes)
    if (!/^[A-Z]{3}$/.test(origin)) {
      alert('Please enter a valid 3-letter airport code for origin (e.g., KHI, LHE, ISB)')
      return
    }
    
    if (!/^[A-Z]{3}$/.test(destination)) {
      alert('Please enter a valid 3-letter airport code for destination (e.g., KHI, LHE, ISB)')
      return
    }
    
    const apiParams: FlightSearchParams = {
      origin,
      destination,
      departure_date: params.departureDate,
      return_date: params.tripType === 'ROUND_TRIP' ? params.returnDate : undefined,
      adults: params.passengers?.adults || 1,
      children: params.passengers?.children || 0,
      infants: params.passengers?.infants || 0,
      cabin_class: (params.cabinClass && cabinClassMap[params.cabinClass]) || 'economy',
    }
    
    setSearchParams(apiParams)
    setHasSearched(true)
    
    // Scroll to results section after a short delay
    setTimeout(() => {
      const resultsSection = document.querySelector('[data-flight-results]')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
            alt="Airplane in flight"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/80 via-cyan-900/70 to-teal-900/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Fly Smart, Travel Easy
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              Optimized travel choices powered by advanced AI
            </p>

            <div className="mx-auto max-w-5xl px-4 flex items-center gap-4">
              <div className="flex-1 border-t border-dashed border-blue-950/85" />
              <div className="w-12 h-12 rounded-full bg-slate-950/95 border-2 border-blue-800/85 flex items-center justify-center shadow-lg shadow-blue-950/70">
                <Plane className="w-5 h-5 text-blue-300" />
              </div>
              <div className="flex-1 border-t border-dashed border-blue-950/85" />
            </div>
          </motion.div>

          {/* Flight Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <FlightSearchForm 
              onSearch={handleSearch} 
              isLoading={isLoading}
              initialParams={formInitialParams || undefined}
            />
          </motion.div>
          
        </div>

        {/* Scroll Indicator removed per design request */}
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 px-4 bg-gray-900/70 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Explore Airports in Pakistan
            </h2>
            <p className="text-cyan-100">
              Discover airports located in cities across the country
            </p>

            <div className="mt-8">
              <div className="mx-auto flex w-full justify-center overflow-x-auto pb-2 no-scrollbar">
                <div className="inline-flex items-center gap-3 whitespace-nowrap px-2">
                  {airportProvinceFilters.map((province) => {
                    const isActive = selectedAirportProvince === province.value
                    return (
                      <button
                        key={province.value}
                        onClick={() => setSelectedAirportProvince(province.value)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] ring-1 ring-cyan-300/70'
                            : 'bg-slate-950/90 border border-cyan-400/45 text-cyan-100 hover:bg-slate-900/95 hover:border-cyan-300/70 hover:text-white'
                        }`}
                      >
                        <Plane className="w-3.5 h-3.5" />
                        {province.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <PopularRoutesCarousel 
            routes={filteredPopularRoutes}
            onAirportSelect={(route) => {
              setSelectedAirportData({
                id: route.id,
                code: route.origin.code,
                name: route.origin.name,
                city: route.origin.city,
                country: route.origin.country,
                province: route.destination.country,
                airportType: route.airportType || 'Domestic',
                image: route.image,
              })
            }}
          />
        </div>
      </section>

      {/* Available Flights Section (Glassy) */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-blue-800/40 via-cyan-900/40 to-teal-900/40" data-flight-results>
        {/* Mid-page Plane Divider */}
        <div className="absolute left-0 right-0 top-0 -translate-y-1/2 px-4 z-20 pointer-events-none">
          <div className="mx-auto max-w-7xl flex items-center gap-4">
            <div className="flex-1 border-t border-dashed border-cyan-500/40" />
            <div className="w-12 h-12 rounded-full bg-slate-950 border border-cyan-400/70 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Plane className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="flex-1 border-t border-dashed border-cyan-500/40" />
          </div>
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="rounded-2xl bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-[0_10px_30px_rgba(2,132,199,0.15)] p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FlightFilters />
            </div>

            {/* Flight Results */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">
                  {isLoading ? 'Searching Flights...' : 
                   error ? 'Error Loading Flights' :
                   flightResults ? `Available Flights (${flightResults.total || 0})` :
                   hasSearched ? 'No Flights Found' :
                   'Available Flights (0)'}
                </h3>
                {flightResults && flightResults.total > 0 && (
                  <div className="flex items-center space-x-4">
                    <select className="bg-gray-900/70 border border-white/10 rounded-lg px-4 py-2 text-white backdrop-blur">
                      <option>Sort by Price</option>
                      <option>Sort by Duration</option>
                      <option>Sort by Departure</option>
                    </select>
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-700/40 animate-pulse">
                      <div className="h-32 bg-gray-700/50 rounded"></div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6 text-center">
                  <p className="text-red-400 mb-2">Failed to load flights</p>
                  <p className="text-gray-400 text-sm">
                    {error instanceof Error ? error.message : 'Please try again later'}
                  </p>
                </div>
              )}

              {!isLoading && !error && flightResults && flightResults.data && flightResults.data.length > 0 && (
                <div className="space-y-4">
                  {flightResults.data.map((flight, index) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <FlightCard 
                        flight={flight} 
                        onSelect={() => handleFlightSelect(flight)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {!isLoading && !error && hasSearched && (!flightResults || flightResults.data.length === 0) && (
                <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-12 border border-cyan-700/40 text-center">
                  <Plane className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No flights found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
                </div>
              )}

              {!hasSearched && (
                <div className="space-y-4">
                  {mockFlights.slice(0, 4).map((flight, index) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <FlightCard 
                        flight={flight} 
                        onSelect={() => handleFlightSelect(flight)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Flight Details Modal */}
      {showDetailsModal && selectedFlight && (
        <FlightDetailsModal
          flight={selectedFlight}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Airport Details Modal */}
      {selectedAirportData && (
        <AirportDetailsModal
          isOpen={!!selectedAirportData}
          onClose={() => setSelectedAirportData(null)}
          onViewOnMap={(airportData) => {
            setSelectedAirportData(null)
            setMapAirport(airportData)
          }}
          airport={selectedAirportData}
        />
      )}

      <AirportMapModal
        isOpen={!!mapAirport}
        onClose={() => setMapAirport(null)}
        onBack={() => {
          if (!mapAirport) return
          setSelectedAirportData(mapAirport)
          setMapAirport(null)
        }}
        airport={mapAirport}
      />
    </div>
  )
}
