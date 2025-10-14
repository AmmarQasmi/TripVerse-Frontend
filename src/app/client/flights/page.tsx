'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FlightSearchForm } from '@/components/flights/FlightSearchForm'
import { PopularRoutesCarousel } from '@/components/flights/PopularRoutesCarousel'
import { FlightCard } from '@/components/flights/FlightCard'
import { FlightFilters } from '@/components/flights/FlightFilters'
import { FlightDetailsModal } from '@/components/flights/FlightDetailsModal'
import { TrustSection } from '@/components/flights/TrustSection'
import { Plane } from 'lucide-react'
import { DomesticFlightGuide } from '@/components/flights/DomesticFlightGuide'
import { TransparentHeader } from '@/components/shared/TransparentHeader'

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

const mockPopularRoutes = [
  {
    id: '1',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    startingPrice: 73500,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 15
  },
  {
    id: '2',
    origin: { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan' },
    destination: { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
    startingPrice: 81200,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 10
  },
  {
    id: '3',
    origin: { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
    destination: { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    startingPrice: 95000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 20
  },
  {
    id: '4',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    startingPrice: 210000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 12
  },
  {
    id: '5',
    origin: { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan' },
    destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    startingPrice: 78000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 8
  },
  {
    id: '6',
    origin: { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
    destination: { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
    startingPrice: 83000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 9
  },
  {
    id: '7',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    startingPrice: 99000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 6
  },
  {
    id: '8',
    origin: { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
    destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    startingPrice: 76000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 7
  },
  {
    id: '9',
    origin: { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan' },
    destination: { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    startingPrice: 98000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 5
  },
  {
    id: '10',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
    startingPrice: 82000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 10
  }
]

// Domestic flight details (curated from user's dataset, condensed)
const domesticFlights = [
  { key: 'skardu', region: 'Northern Areas', area: 'Skardu', airport: 'Skardu (KDU)', airlines: 'PIA, Airblue', frequency: 'Daily to 3x/week', pricePKR: '28,000–35,000', priceUSD: '100–125', duration: '≈ 1 hr', bestTime: 'May–Sept', hotels: ['Serena Shigar Fort', 'Shangrila Resort', 'Hotel One Skardu'] },
  { key: 'gilgit', region: 'Northern Areas', area: 'Gilgit', airport: 'Gilgit (GIL)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '15,000–20,000', priceUSD: '55–70', duration: '≈ 1 hr', bestTime: 'Apr–Oct', hotels: ['Serena Gilgit', 'Madina Hotel 2', 'Riveria Hotel'] },
  { key: 'hunza', region: 'Northern Areas', area: 'Hunza (via Gilgit)', airport: 'Gilgit (GIL)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '15,000–20,000', priceUSD: '55–70', duration: '≈ 1 hr', bestTime: 'Apr–Oct', hotels: ['Luxus Hunza', 'Hard Rock Hunza', 'Darbar Hotel'] },
  { key: 'chitral', region: 'Northern Areas', area: 'Chitral', airport: 'Chitral (CJL)', airlines: 'PIA', frequency: '1–2/week', pricePKR: '25,000–30,000', priceUSD: '90–110', duration: '≈ 1.5 hr', bestTime: 'May–Sept', hotels: ['Hindukush Heights', 'Pamir Riverside Inn'] },
  { key: 'swat', region: 'Northern Areas', area: 'Swat / Malam Jabba', airport: 'Saidu Sharif (SDT)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '20,000–25,000', priceUSD: '70–90', duration: '≈ 45 min', bestTime: 'Mar–Aug', hotels: ['PC Malam Jabba', 'Shelton Rezidor', 'Rock City Resort'] },
  { key: 'naran', region: 'Northern Areas', area: 'Naran / Kaghan (via ISB)', airport: 'Islamabad (ISB)', airlines: 'PIA, Serene, AirSial', frequency: 'Multiple daily', pricePKR: '10,000–18,000', priceUSD: '35–60', duration: '1–1.5 hr', bestTime: 'May–Sept', hotels: ['Pine Park Shogran', 'Demanchi', 'Arcadian Riverside'] },
  { key: 'fairy', region: 'Northern Areas', area: 'Fairy Meadows (via Gilgit)', airport: 'Gilgit (GIL)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '15,000–20,000', priceUSD: '55–70', duration: '≈ 1 hr', bestTime: 'Jun–Sept', hotels: ['Raikot Sarai', 'Fairy Meadows Cottages'] },
  { key: 'astore', region: 'Northern Areas', area: 'Astore / Rama Lake', airport: 'Skardu (KDU)', airlines: 'PIA', frequency: '3x/week', pricePKR: '28,000–35,000', priceUSD: '100–125', duration: '≈ 1 hr', bestTime: 'May–Sept', hotels: ['Rama Lake Guest House', 'Wazir Guest House'] },
  { key: 'shigar', region: 'Northern Areas', area: 'Khaplu / Shigar', airport: 'Skardu (KDU)', airlines: 'PIA', frequency: '3x/week', pricePKR: '28,000–35,000', priceUSD: '100–125', duration: '≈ 1 hr', bestTime: 'May–Sept', hotels: ['Serena Shigar Fort', 'Khaplu Palace'] },
  { key: 'kalam', region: 'Khyber Pakhtunkhwa', area: 'Kalam', airport: 'Saidu Sharif (SDT)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '20,000–25,000', priceUSD: '70–90', duration: '≈ 45 min', bestTime: 'May–Aug', hotels: ['Greens Hotel Kalam', 'Walnut Heights'] },
  { key: 'nathiagali', region: 'Khyber Pakhtunkhwa', area: 'Nathiagali / Abbottabad', airport: 'Islamabad (ISB)', airlines: 'All major', frequency: 'Daily', pricePKR: '10,000–18,000', priceUSD: '35–60', duration: '≈ 45 min', bestTime: 'Mar–July', hotels: ['Summer Retreat', 'Alpine Hotel', 'Amore Hotel'] },
  { key: 'dir', region: 'Khyber Pakhtunkhwa', area: 'Dir / Kumrat', airport: 'Chitral (CJL)', airlines: 'PIA', frequency: '1–2/week', pricePKR: '25,000–30,000', priceUSD: '90–110', duration: '≈ 1.5 hr', bestTime: 'May–Sept', hotels: ['Kumrat Glamping', 'Green Hills Resort'] },
  { key: 'murree', region: 'Punjab', area: 'Murree', airport: 'Islamabad (ISB)', airlines: 'All major', frequency: 'Daily', pricePKR: '10,000–18,000', priceUSD: '35–60', duration: '≈ 45 min', bestTime: 'Apr–July', hotels: ['Lockwood Murree', 'Maisonette Firhill', 'Grand Taj'] },
  { key: 'lahore', region: 'Punjab', area: 'Lahore', airport: 'Allama Iqbal (LHE)', airlines: 'PIA, Airblue, Serene, AirSial', frequency: 'Frequent', pricePKR: '10,000–15,000', priceUSD: '35–55', duration: '≈ 1 hr', bestTime: 'Oct–Mar', hotels: ['Avari Lahore', 'Faletti’s', 'Pearl Continental'] },
  { key: 'multan', region: 'Punjab', area: 'Multan', airport: 'Multan (MUX)', airlines: 'PIA, Serene, Airblue', frequency: '2–3/day', pricePKR: '10,000–15,000', priceUSD: '35–55', duration: '≈ 1 hr', bestTime: 'Nov–Feb', hotels: ['Ramada Multan', 'Hotel One', 'Avari Xpress'] },
  { key: 'karachi', region: 'Sindh', area: 'Karachi', airport: 'Jinnah (KHI)', airlines: 'All major', frequency: 'Hourly', pricePKR: '12,000–18,000', priceUSD: '40–60', duration: '≈ 1.5 hr', bestTime: 'Oct–Mar', hotels: ['Avari Towers', 'Pearl Continental', 'Movenpick'] },
  { key: 'hyderabad', region: 'Sindh', area: 'Hyderabad', airport: 'Karachi (KHI)', airlines: 'PIA, Serene', frequency: 'Via Karachi', pricePKR: '12,000–18,000', priceUSD: '40–60', duration: '≈ 1.5 hr', bestTime: 'Nov–Feb', hotels: ['Indus Hotel', 'Royal Inn', 'Hotel City Gate'] },
  { key: 'gwadar', region: 'Sindh (Coastal)', area: 'Gwadar', airport: 'Gwadar (GWD)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '14,000–22,000', priceUSD: '45–75', duration: '≈ 1.5 hr', bestTime: 'Nov–Mar', hotels: ['PC Gwadar', 'Sadaf Resort', 'Business Center'] },
  { key: 'kund', region: 'Sindh (Coastal)', area: 'Kund Malir / Hingol', airport: 'Karachi (KHI)', airlines: 'PIA', frequency: 'Via Karachi', pricePKR: '12,000–18,000', priceUSD: '40–60', duration: '≈ 1.5 hr', bestTime: 'Nov–Feb', hotels: ['Ormara Beach Resort', 'Kund Malir Huts'] },
  { key: 'quetta', region: 'Balochistan', area: 'Quetta', airport: 'Quetta (UET)', airlines: 'PIA, Serene', frequency: '3–4/week', pricePKR: '12,000–20,000', priceUSD: '40–70', duration: '≈ 1.5 hr', bestTime: 'Oct–Mar', hotels: ['Serena Quetta', 'Bloom Star', 'Hotel Mehran'] },
  { key: 'ziarat', region: 'Balochistan', area: 'Ziarat', airport: 'Quetta (UET)', airlines: 'PIA', frequency: '3–4/week', pricePKR: '12,000–20,000', priceUSD: '40–70', duration: '≈ 1.5 hr', bestTime: 'Nov–Mar', hotels: ['Ziarat Hill Resort', 'PTDC Motel Ziarat'] },
  { key: 'ormara', region: 'Balochistan (Coastal)', area: 'Ormara', airport: 'Gwadar (GWD)', airlines: 'PIA', frequency: 'Via Gwadar', pricePKR: '14,000–22,000', priceUSD: '45–75', duration: '≈ 1.5 hr', bestTime: 'Nov–Mar', hotels: ['Ormara Beach Resort', 'Sadaf Resort'] },
  { key: 'turbat', region: 'Balochistan (Remote)', area: 'Turbat', airport: 'Turbat (TUK)', airlines: 'PIA', frequency: '2/week', pricePKR: '20,000–30,000', priceUSD: '70–105', duration: '≈ 2 hr', bestTime: 'Nov–Mar', hotels: ['Kech Hotel', 'Turbat Continental'] },
  { key: 'islamabad', region: 'Islamabad / Federal', area: 'Islamabad City', airport: 'Islamabad (ISB)', airlines: 'All major', frequency: 'Hub', pricePKR: '10,000–15,000', priceUSD: '35–55', duration: '—', bestTime: 'Year-round', hotels: ['Serena Hotel', 'Marriott', 'Ramada'] },
  { key: 'ajk-muzaffarabad', region: 'Azad Kashmir', area: 'Muzaffarabad', airport: 'Islamabad (ISB)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '10,000–15,000', priceUSD: '35–55', duration: '≈ 45 min', bestTime: 'Apr–Aug', hotels: ['Neelum View Hotel', 'PC Muzaffarabad'] },
  { key: 'ajk-neelum', region: 'Azad Kashmir', area: 'Neelum Valley', airport: 'Islamabad (ISB)', airlines: 'PIA', frequency: '2–3/week', pricePKR: '10,000–15,000', priceUSD: '35–55', duration: '≈ 45 min', bestTime: 'Apr–Aug', hotels: ['Green Village Resort', 'Neelum Star Hotel'] },
] as const

const airlineSummary = [
  { name: 'PIA (Pakistan International Airlines)', destinations: 'Gilgit, Skardu, Chitral, Saidu Sharif, Quetta, Bahawalpur, Gwadar', frequency: '3–7 flights/week depending on route' },
  { name: 'Airblue', destinations: 'Skardu, Karachi, Lahore, Islamabad', frequency: '3–5 flights/week (seasonal for Skardu)' },
  { name: 'Serene Air', destinations: 'Karachi, Islamabad, Quetta, Skardu (limited)', frequency: 'Daily major cities, few northern' },
  { name: 'AirSial', destinations: 'Karachi, Lahore, Islamabad, Peshawar, Quetta', frequency: 'Daily intercity routes' },
  { name: 'Fly Jinnah', destinations: 'Karachi, Lahore, Islamabad, Quetta, Skardu (seasonal)', frequency: '3–5 flights/week (seasonal to Skardu)' },
] as const

export default function FlightsPage() {
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'ECONOMY'
  })

  const handleFlightSelect = (flight: any) => {
    setSelectedFlight(flight)
    setShowDetailsModal(true)
  }

  const handleSearch = (params: any) => {
    setSearchParams(params)
    // In real app, this would trigger API call
    console.log('Searching flights with:', params)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 relative">
      {/* Transparent Header */}
      <TransparentHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Background Image (daytime plane) */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center opacity-25"
            style={{
              backgroundImage: "url('/images/bg/plane-day.jpg')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/80 via-cyan-900/70 to-teal-900/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto w-full mt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              ✈️ Find, Compare & Book Your Perfect Flight
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              Experience secure, smart, and affordable bookings — powered by AI.
            </p>
          </motion.div>

          {/* Flight Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <FlightSearchForm onSearch={handleSearch} />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-300 mt-6 text-sm"
          >
            Discover the most popular destinations from Pakistan
          </motion.p>
        </div>

        {/* Scroll Indicator removed per design request */}
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 px-4 bg-gray-900/70 backdrop-blur-md">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Popular Routes & Deals
            </h2>
            <p className="text-cyan-100">
              Discover the most popular destinations from Pakistan
            </p>
          </motion.div>

          <PopularRoutesCarousel routes={mockPopularRoutes} />
        </div>
      </section>

      {/* Available Flights Section (Glassy) */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-800/40 via-cyan-900/40 to-teal-900/40">
        <div className="container mx-auto max-w-7xl">
          <div className="rounded-2xl bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-[0_10px_30px_rgba(2,132,199,0.15)] p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FlightFilters />
            </div>

            {/* Flight Results */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Available Flights ({mockFlights.length})
                </h3>
                <div className="flex items-center space-x-4">
                  <select className="bg-gray-900/70 border border-white/10 rounded-lg px-4 py-2 text-white backdrop-blur">
                    <option>Sort by Price</option>
                    <option>Sort by Duration</option>
                    <option>Sort by Departure</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {mockFlights.map((flight, index) => (
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
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Domestic Flight Guide */}
      <DomesticFlightGuide flights={domesticFlights} />

      {/* Major Airline Summary */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center space-x-2">
              <Plane className="w-5 h-5 text-emerald-400 drop-shadow" />
              <h2 className="text-3xl font-semibold text-white tracking-wide">Major Domestic Airlines</h2>
            </div>
            <div className="h-[2px] w-24 mx-auto mt-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {airlineSummary.map((a) => {
              const brandFull = a.name.toLowerCase()
              const brand = a.name.split(' ')[0].toLowerCase()
              const borderGradient =
                brand.includes('pia')
                  ? 'from-emerald-500 via-cyan-500 to-teal-500'
                  : brand.includes('airblue')
                  ? 'from-blue-500 via-cyan-500 to-teal-500'
                  : brand.includes('serene')
                  ? 'from-teal-400 via-cyan-500 to-blue-500'
                  : brand.includes('airsial')
                  ? 'from-cyan-500 via-blue-500 to-teal-500'
                  : 'from-cyan-500 via-blue-600 to-teal-500'

              // map to logo slugs in /public/images/airlines
              let logoSlug = 'generic'
              if (brandFull.includes('pia')) logoSlug = 'pia'
              else if (brandFull.includes('airblue')) logoSlug = 'airblue'
              else if (brandFull.includes('serene')) logoSlug = 'serene'
              else if (brandFull.includes('airsial')) logoSlug = 'airsial'
              else if (brandFull.includes('fly')) logoSlug = 'flyjinnah'

              return (
                <div key={a.name} className={`rounded-2xl p-[1px] bg-gradient-to-r ${borderGradient} shadow-[0_10px_30px_rgba(2,132,199,0.2)] transition-transform duration-300 hover:scale-[1.03]`}>
                  <div className="rounded-2xl bg-gray-900/70 backdrop-blur-lg p-6 h-full border border-white/5">
                    <div className="flex items-start space-x-4">
                      {/* Logo */}
                      <div className="relative shrink-0 w-12 h-12 rounded-full bg-gray-950/50 flex items-center justify-center shadow-inner overflow-hidden">
                        {/* Initials fallback (always present) */}
                        <span className="absolute inset-0 flex items-center justify-center text-white/80 text-xs font-semibold">
                          {a.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 3)
                            .toUpperCase()}
                        </span>
                        {/* Logo image overlays initials when available */}
                        <img
                          src={`/images/airlines/${logoSlug}.png`}
                          alt={`${a.name} logo`}
                          className="relative z-10 w-10 h-10 object-contain"
                          onError={(e) => {
                            // Try a secondary extension, then fall back to a generic logo
                            const img = e.currentTarget as HTMLImageElement
                            const triedSvg = img.getAttribute('data-tried-svg') === '1'
                            const triedGeneric = img.getAttribute('data-tried-generic') === '1'
                            if (!triedSvg) {
                              img.setAttribute('data-tried-svg', '1')
                              img.src = `/images/airlines/${logoSlug}.svg`
                            } else if (!triedGeneric) {
                              img.setAttribute('data-tried-generic', '1')
                              img.src = '/images/airlines/generic.png'
                            } else {
                              // Finally hide if nothing exists; initials remain visible
                              img.style.display = 'none'
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">{a.name}</h3>
                        <div className="text-sm text-gray-300 mt-2">
                          <span className="text-gray-400">Common Destinations:</span>
                          <span className="text-cyan-100"> {a.destinations}</span>
                        </div>
                        <div className="text-sm text-cyan-300 font-medium mt-2">
                          <span className="text-cyan-300">Frequency:</span> {a.frequency}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>


      



      {/* Trust Section */}
      <TrustSection />

      {/* Flight Details Modal */}
      {showDetailsModal && selectedFlight && (
        <FlightDetailsModal
          flight={selectedFlight}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  )
}
