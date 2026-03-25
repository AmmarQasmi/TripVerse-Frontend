'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CarApiResponse, BookingType, PriceCalculationResponse } from '@/types'
import { carsApi } from '@/lib/api/cars.api'
import { paymentsApi } from '@/lib/api/payments.api'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { RouteMap } from './RouteMap'
import { BookingCalendar } from './BookingCalendar'

// Booking mode selector type
type BookingMode = 'within-city' | 'city-to-city' | 'auto'

interface CarBookingModalProps {
  isOpen: boolean
  onClose: () => void
  car: CarApiResponse
  initialData?: {
    pickupLocation?: string
    pickupDate?: string
  }
}

interface PriceBreakdown {
  base_price: number
  distance_price: number
  time_price?: number
  total_amount: number
  driver_earnings: number
  platform_fee: number
  platform_fee_percentage: number
  // Ride-hailing specific
  base_fare?: number
  distance_fare?: number
  time_fare?: number
  surge_multiplier?: number
  minimum_fare?: number
}

interface DetectedCities {
  pickup_city_name: string | null
  pickup_city_id: number | null
  dropoff_city_name: string | null
  dropoff_city_id: number | null
  same_city: boolean
}

export default function CarBookingModal({ isOpen, onClose, car, initialData }: CarBookingModalProps) {
  const [step, setStep] = useState(0) // Start at step 0 (mode selection)
  const [bookingMode, setBookingMode] = useState<BookingMode>('auto')
  const [detectedBookingType, setDetectedBookingType] = useState<BookingType | null>(null)
  const [finalBookingType, setFinalBookingType] = useState<BookingType | null>(null)
  const [detectedCities, setDetectedCities] = useState<DetectedCities | null>(null)
  const [showAutoDetectConfirm, setShowAutoDetectConfirm] = useState(false)
  
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [numberOfDays, setNumberOfDays] = useState(1)
  const [customerNotes, setCustomerNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  
  // Ride-hailing specific states
  const [scheduledPickup, setScheduledPickup] = useState('')
  const [isAsap, setIsAsap] = useState(true)
  const [estimatedDuration, setEstimatedDuration] = useState(0)
  const [surgeMultiplier, setSurgeMultiplier] = useState(1)
  
  // Autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([])
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false)
  const [pickupInputFocused, setPickupInputFocused] = useState(false)
  const [dropoffInputFocused, setDropoffInputFocused] = useState(false)
  
  // City restriction for ride-hailing
  const [pickupCity, setPickupCity] = useState<string | null>(null)
  
  // Price calculation
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null)
  const [estimatedDistance, setEstimatedDistance] = useState(0)
  const [tripDays, setTripDays] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Unavailable dates
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  const today = new Date().toISOString().split('T')[0]
  const supportsRental = car?.availability?.available_for_rental ?? true
  const supportsRideHailing = car?.availability?.available_for_ride_hailing ?? false
  const isSingleModeCar = supportsRental !== supportsRideHailing
  const fixedBookingModeLabel = supportsRideHailing && !supportsRental
    ? 'Within City Ride'
    : supportsRental && !supportsRideHailing
      ? 'City to City Rental'
      : null

  // Compute end date from pickup date + number of days
  const computeEndDate = (startDate: string, days: number): string => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  // Initialize with cached data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.pickupLocation) {
        setPickupLocation(initialData.pickupLocation)
        setPickupCity(extractCity(initialData.pickupLocation))
      }
      if (initialData.pickupDate) {
        setPickupDate(initialData.pickupDate)
      }
    }
  }, [isOpen, initialData])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(0)
      setBookingMode('auto')
      setDetectedBookingType(null)
      setFinalBookingType(null)
      setDetectedCities(null)
      setShowAutoDetectConfirm(false)
      setPickupLocation('')
      setDropoffLocation('')
      setPickupDate('')
      setNumberOfDays(1)
      setCustomerNotes('')
      setPaymentMethod('wallet')
      setPriceBreakdown(null)
      setEstimatedDistance(0)
      setTripDays(0)
      setErrors({})
      setPickupSuggestions([])
      setDropoffSuggestions([])
      setUnavailableDates([])
      setScheduledPickup('')
      setIsAsap(true)
      setEstimatedDuration(0)
      setSurgeMultiplier(1)
      setPickupCity(null)
    }
  }, [isOpen])

  // Auto-select booking mode for single-mode cars.
  // Only hybrid cars should see the mode selection question.
  useEffect(() => {
    if (!isOpen) return

    if (supportsRideHailing && !supportsRental) {
      setBookingMode('within-city')
      setFinalBookingType('RIDE_HAILING')
      setStep(1)
      return
    }

    if (supportsRental && !supportsRideHailing) {
      setBookingMode('city-to-city')
      setFinalBookingType('RENTAL')
      setStep(1)
      return
    }

    // Hybrid (or unknown) cars: show mode selection as usual.
    setBookingMode('auto')
    setFinalBookingType(null)
    setStep(0)
  }, [isOpen, supportsRental, supportsRideHailing])

  // Fetch unavailable dates when modal opens (only for rental mode)
  useEffect(() => {
    // Only fetch unavailable dates for rental mode
    if (isOpen && car?.id && (bookingMode === 'city-to-city' || bookingMode === 'auto')) {
      setIsLoadingDates(true)
      carsApi.getUnavailableDates(car.id, 'rental')
        .then(result => {
          setUnavailableDates(result.unavailable_dates || [])
        })
        .catch(() => {
          setUnavailableDates([])
        })
        .finally(() => setIsLoadingDates(false))
    } else if (bookingMode === 'within-city') {
      // Skip calendar for ride-hailing
      setUnavailableDates([])
    }
  }, [isOpen, car?.id, bookingMode])

  // Extract city name from a Google Places description
  // e.g. "Clifton, Khayaban-e-Iqbal Rd, Karachi, Pakistan" → "Karachi"
  const extractCity = (description: string): string | null => {
    const parts = description.split(',').map(p => p.trim())
    // City is typically second-to-last (last is "Pakistan")
    if (parts.length >= 2) {
      const candidate = parts[parts.length - 2]
      // Avoid returning province/country names as city
      const provinceNames = ['Pakistan', 'Sindh', 'Punjab', 'Balochistan', 'KPK', 'Khyber Pakhtunkhwa', 'Islamabad Capital Territory']
      if (!provinceNames.includes(candidate)) return candidate
      // If second-to-last is a province, try third-to-last
      if (parts.length >= 3) return parts[parts.length - 3]
    }
    // Fallback for simple values like "Karachi"
    if (parts.length === 1 && parts[0]) {
      return parts[0]
    }
    return null
  }

  // Keep pickup city in sync for prefilled/manual values (important for within-city mode).
  useEffect(() => {
    if (!pickupLocation) {
      setPickupCity(null)
      return
    }
    const city = extractCity(pickupLocation)
    if (city) {
      setPickupCity(city)
    }
  }, [pickupLocation])

  // Check if ride-hailing mode is active
  const isRideHailingMode = bookingMode === 'within-city' || finalBookingType === 'RIDE_HAILING'

  // Autocomplete handler
  const fetchSuggestions = useCallback(async (input: string, type: 'pickup' | 'dropoff') => {
    if (input.length < 2) {
      type === 'pickup' ? setPickupSuggestions([]) : setDropoffSuggestions([])
      return
    }
    try {
      const result = await carsApi.autocompleteLocation(input, 'pk')
      const suggestions = result.suggestions || []
      
      if (type === 'pickup') {
        setPickupSuggestions(suggestions)
        setShowPickupSuggestions(true)
      } else {
        setDropoffSuggestions(suggestions)
        setShowDropoffSuggestions(true)
      }
    } catch {
      // silently fail
    }
  }, [])

  // Debounced autocomplete for pickup
  useEffect(() => {
    if (!pickupInputFocused || pickupLocation.length < 2) return
    const timer = setTimeout(() => {
      fetchSuggestions(pickupLocation, 'pickup')
    }, 300)
    return () => clearTimeout(timer)
  }, [pickupLocation, fetchSuggestions, pickupInputFocused])

  // Debounced autocomplete for dropoff
  useEffect(() => {
    if (!dropoffInputFocused || dropoffLocation.length < 2) return
    const timer = setTimeout(() => {
      fetchSuggestions(dropoffLocation, 'dropoff')
    }, 300)
    return () => clearTimeout(timer)
  }, [dropoffLocation, fetchSuggestions, dropoffInputFocused])

  // Validate Step 1 based on booking mode
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!pickupLocation.trim()) newErrors.pickup = 'Pickup location is required'
    if (!dropoffLocation.trim()) newErrors.dropoff = 'Drop-off location is required'
    
    // Mode-specific validation
    if (bookingMode === 'city-to-city' || finalBookingType === 'RENTAL') {
      // Rental requires dates
      if (!pickupDate) newErrors.pickupDate = 'Pickup date is required'
      if (numberOfDays < 1 || numberOfDays > 30) newErrors.days = 'Days must be between 1 and 30'

      // Manual rental mode must be intercity.
      if (bookingMode === 'city-to-city') {
        const pickupCityName = extractCity(pickupLocation)
        const dropoffCityName = extractCity(dropoffLocation)

        if (
          pickupCityName &&
          dropoffCityName &&
          pickupCityName.toLowerCase() === dropoffCityName.toLowerCase()
        ) {
          newErrors.dropoff = `Drop-off must be outside ${pickupCityName}`
        }
      }
    } else if (bookingMode === 'within-city' || finalBookingType === 'RIDE_HAILING') {
      // Ride-hailing: if not ASAP, need scheduled time
      if (!isAsap && !scheduledPickup) newErrors.scheduledPickup = 'Scheduled pickup time is required'
    } else if (bookingMode === 'auto') {
      // For auto mode, require dates (we'll determine type after calculation)
      if (!pickupDate) newErrors.pickupDate = 'Pickup date is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Get booking type based on mode selection
  const getSelectedBookingType = (): BookingType | undefined => {
    if (bookingMode === 'within-city') return 'RIDE_HAILING'
    if (bookingMode === 'city-to-city') return 'RENTAL'
    return undefined // Auto-detect
  }

  const normalizeLocationText = useCallback(async (input: string, preferredCity?: string) => {
    const trimmed = input.trim()
    if (!trimmed) return trimmed

    const result = await carsApi.autocompleteLocation(trimmed, 'pk').catch(() => ({ suggestions: [] as any[] }))
    const suggestions = result.suggestions || []
    if (suggestions.length === 0) return trimmed

    if (preferredCity) {
      const preferred = suggestions.find((s: any) => {
        const desc = (s.description || '').toLowerCase()
        return desc.includes(preferredCity.toLowerCase())
      })
      if (preferred?.description) return preferred.description
    }

    return suggestions[0].description || trimmed
  }, [])

  const handleNext = async () => {
    // Step 0: Mode selection -> Step 1
    if (step === 0) {
      setStep(1)
      return
    }
    
    // Step 1: Route selection -> Calculate price and go to Step 2
    if (step === 1) {
      if (!validateStep1()) return
      
      setIsCalculating(true)
      try {
        const selectedType = getSelectedBookingType()
        const isRideFlow = selectedType === 'RIDE_HAILING' || bookingMode === 'within-city'
        const endDate = pickupDate ? computeEndDate(pickupDate, numberOfDays) : undefined
        let effectivePickupLocation = pickupLocation
        let effectiveDropoffLocation = dropoffLocation

        if (isRideFlow) {
          effectivePickupLocation = await normalizeLocationText(pickupLocation)
          const normalizedCity = extractCity(effectivePickupLocation) || pickupCity || undefined
          effectiveDropoffLocation = await normalizeLocationText(dropoffLocation, normalizedCity)

          setPickupLocation(effectivePickupLocation)
          setDropoffLocation(effectiveDropoffLocation)
          if (normalizedCity) {
            setPickupCity(normalizedCity)
          }
        }
        
        const result = await carsApi.calculatePrice(
          car.id,
          effectivePickupLocation,
          effectiveDropoffLocation,
          {
            bookingType: selectedType,
            startDate: (bookingMode !== 'within-city') ? pickupDate : undefined,
            endDate: (bookingMode !== 'within-city') ? endDate : undefined,
            scheduledPickup: (bookingMode === 'within-city' && !isAsap) ? scheduledPickup : undefined,
          }
        )
        
        // Store detected info
        if (isRideFlow && result.detected_cities && !result.detected_cities.same_city) {
          setErrors(prev => ({
            ...prev,
            dropoff: 'Within City Ride requires pickup and drop-off in the same city. Choose locations inside one city.',
          }))
          showToast('Ride-hailing is only available within the same city. Please choose a drop-off in the same city.', 'error')
          return
        }

        setDetectedCities(result.detected_cities)
        setDetectedBookingType(result.detected_booking_type)
        setFinalBookingType(result.booking_type)
        setEstimatedDistance(result.estimated_distance)
        setTripDays(result.trip_duration_days ?? numberOfDays)
        setEstimatedDuration(result.estimated_duration ?? 0)
        setSurgeMultiplier(result.pricing_breakdown.surge_multiplier ?? 1)
        
        // Build price breakdown
        setPriceBreakdown({
          base_price: result.pricing_breakdown.base_price ?? 0,
          distance_price: result.pricing_breakdown.distance_price ?? 0,
          time_price: (result.pricing_breakdown as any).time_price,
          total_amount: result.pricing_breakdown.total_amount,
          driver_earnings: result.pricing_breakdown.driver_earnings,
          platform_fee: result.pricing_breakdown.platform_fee,
          platform_fee_percentage: result.pricing_breakdown.platform_fee_percentage,
          // Ride-hailing specific
          base_fare: result.pricing_breakdown.base_fare ?? result.pricing_breakdown.base_price,
          distance_fare: result.pricing_breakdown.distance_fare ?? result.pricing_breakdown.distance_price,
          time_fare: result.pricing_breakdown.time_fare ?? (result.pricing_breakdown as any).time_price,
          surge_multiplier: result.pricing_breakdown.surge_multiplier,
          minimum_fare: result.pricing_breakdown.minimum_fare,
        })
        
        // Check if auto-detection differs from user expectation
        if (bookingMode === 'auto' && result.detected_booking_type !== result.booking_type) {
          // No conflict, proceed
        }
        
        setStep(2)
      } catch (error: any) {
        showToast(error?.response?.data?.message || 'Failed to calculate price', 'error')
      } finally {
        setIsCalculating(false)
      }
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (paymentMethod === 'wallet' && priceBreakdown) {
        const wallet = await paymentsApi.getWalletBalance()
        const availablePaisa = BigInt(wallet.available)
        const requiredPaisa = BigInt(Math.round(priceBreakdown.total_amount * 100))
        if (availablePaisa < requiredPaisa) {
          showToast('Insufficient wallet balance. Please top up your balance.', 'error')
          return
        }
      }

      const endDate = pickupDate ? computeEndDate(pickupDate, numberOfDays) : undefined
      
      await carsApi.createBookingRequest({
        car_id: parseInt(car.id),
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        booking_type: finalBookingType || undefined,
        start_date: finalBookingType === 'RENTAL' ? pickupDate : undefined,
        end_date: finalBookingType === 'RENTAL' ? endDate : undefined,
        scheduled_pickup: finalBookingType === 'RIDE_HAILING' && !isAsap ? scheduledPickup : undefined,
        customer_notes: customerNotes || undefined,
        payment_method: paymentMethod,
      })
      
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['car-bookings', 'user'] })
      
      onClose()
      showToast(
        paymentMethod === 'wallet'
          ? 'Booking request sent. Your wallet amount is held and will be released after trip completion and your approval.'
          : 'Booking request sent to driver! You will be notified when they respond.',
        'success',
      )
      
      setTimeout(() => {
        router.push('/client/cars/bookings')
      }, 1500)
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to send booking request', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
          >
            <div
              className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden max-w-xl w-full shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Book {car.car.make} {car.car.model}</h2>
                    <p className="text-white/70 text-sm mt-1">
                      {car.car.year} &bull; {car.car.seats} seats &bull; {car.car.transmission}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {step > 0 && (
                      <button onClick={() => setStep(step - 1)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {[0, 1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        s < step ? 'bg-white text-[#1e3a8a]' : s === step ? 'bg-white text-[#1e3a8a] ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : 'bg-white/20 text-white/60'
                      }`}>
                        {s < step ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : s + 1}
                      </div>
                      {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-white' : 'bg-white/20'}`} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/70">Mode</span>
                  <span className="text-xs text-white/70">Route</span>
                  <span className="text-xs text-white/70">Review</span>
                  <span className="text-xs text-white/70">Payment</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {/* Step 0: Mode Selection */}
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white mb-1">What type of ride do you need?</h3>
                      <p className="text-sm text-gray-400 mb-4">Choose your booking mode based on your travel needs</p>

                      <div className="space-y-3">
                        {/* Within City Option */}
                        <button
                          onClick={() => setBookingMode('within-city')}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            bookingMode === 'within-city'
                              ? 'border-teal-500 bg-teal-500/10'
                              : 'border-white/10 bg-gray-800 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              bookingMode === 'within-city' ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${bookingMode === 'within-city' ? 'text-white' : 'text-gray-300'}`}>
                                Within City Ride
                              </p>
                              <p className="text-sm text-gray-400 mt-0.5">
                                Quick rides within the same city. Get picked up now or schedule for later.
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-full">Instant booking</span>
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Pay per km</span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* City to City Option */}
                        <button
                          onClick={() => setBookingMode('city-to-city')}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            bookingMode === 'city-to-city'
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-white/10 bg-gray-800 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              bookingMode === 'city-to-city' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${bookingMode === 'city-to-city' ? 'text-white' : 'text-gray-300'}`}>
                                City to City Rental
                              </p>
                              <p className="text-sm text-gray-400 mt-0.5">
                                Long-distance travel between cities. Book for one or more days.
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Multi-day</span>
                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Driver approval</span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Auto Detect Option */}
                        <button
                          onClick={() => setBookingMode('auto')}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            bookingMode === 'auto'
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/10 bg-gray-800 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              bookingMode === 'auto' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${bookingMode === 'auto' ? 'text-white' : 'text-gray-300'}`}>
                                Auto Detect
                              </p>
                              <p className="text-sm text-gray-400 mt-0.5">
                                We&apos;ll automatically determine the best booking type based on your route.
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Smart detection</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Route Selection */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {isSingleModeCar && fixedBookingModeLabel && (
                        <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-teal-300">Booking mode for this car</p>
                            <p className="text-sm font-semibold text-white">{fixedBookingModeLabel}</p>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-full">Auto-selected</span>
                        </div>
                      )}

                      {(bookingMode === 'within-city' || finalBookingType === 'RIDE_HAILING') && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                          <p className="text-xs text-blue-200">
                            Within City Ride rule: pickup and drop-off must be in the same city.
                          </p>
                        </div>
                      )}

                      <h3 className="text-lg font-semibold text-white mb-1">Where are you going?</h3>
                      <p className="text-sm text-gray-400 mb-4">Set your pickup and drop-off locations</p>

                      {/* Pickup Location */}
                      <div className="relative">
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Pickup Location</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="4" />
                          </svg>
                          <input
                            type="text"
                            value={pickupLocation}
                            onChange={(e) => {
                              setPickupLocation(e.target.value)
                              setPickupInputFocused(true)
                              setShowPickupSuggestions(true)
                            }}
                            onFocus={() => {
                              setPickupInputFocused(true)
                              if (pickupLocation.length >= 2) setShowPickupSuggestions(true)
                            }}
                            onBlur={() => setTimeout(() => { setPickupInputFocused(false); setShowPickupSuggestions(false) }, 200)}
                            placeholder="Enter pickup location"
                            className={`w-full pl-9 pr-4 py-2.5 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm ${
                              errors.pickup ? 'border-red-500' : 'border-white/10'
                            }`}
                          />
                        </div>
                        {errors.pickup && <p className="text-xs text-red-400 mt-1">{errors.pickup}</p>}
                        {showPickupSuggestions && pickupSuggestions.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-white/10 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                            {pickupSuggestions.map((s) => (
                              <button
                                key={s.place_id}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setPickupLocation(s.description)
                                  setShowPickupSuggestions(false)
                                  setPickupSuggestions([])
                                  // Extract city for ride-hailing restriction
                                  const city = extractCity(s.description)
                                  setPickupCity(city)
                                  // Clear drop-off when pickup city changes in ride-hailing mode
                                  if (isRideHailingMode && city) {
                                    setDropoffLocation('')
                                    setDropoffSuggestions([])
                                  }
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-700 text-sm text-gray-300 border-b border-white/5 last:border-0 flex items-start gap-2"
                              >
                                <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <span className="font-medium text-white">{s.structured_formatting?.main_text || s.description}</span>
                                  {s.structured_formatting?.secondary_text && (
                                    <span className="text-gray-400 ml-1 text-xs">{s.structured_formatting.secondary_text}</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Dropoff Location */}
                      <div className="relative">
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Drop-off Location</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="4" />
                          </svg>
                          <input
                            type="text"
                            value={dropoffLocation}
                            onChange={(e) => {
                              setDropoffLocation(e.target.value)
                              setDropoffInputFocused(true)
                              setShowDropoffSuggestions(true)
                            }}
                            onFocus={() => {
                              setDropoffInputFocused(true)
                              if (dropoffLocation.length >= 2) setShowDropoffSuggestions(true)
                            }}
                            onBlur={() => setTimeout(() => { setDropoffInputFocused(false); setShowDropoffSuggestions(false) }, 200)}
                            placeholder={isRideHailingMode && pickupCity ? `Search within ${pickupCity}` : 'Enter drop-off location'}
                            className={`w-full pl-9 pr-4 py-2.5 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm ${
                              errors.dropoff ? 'border-red-500' : 'border-white/10'
                            }`}
                          />
                        </div>
                        {errors.dropoff && <p className="text-xs text-red-400 mt-1">{errors.dropoff}</p>}
                        {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-white/10 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                            {dropoffSuggestions.map((s) => (
                              <button
                                key={s.place_id}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setDropoffLocation(s.description)
                                  setShowDropoffSuggestions(false)
                                  setDropoffSuggestions([])
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-700 text-sm text-gray-300 border-b border-white/5 last:border-0 flex items-start gap-2"
                              >
                                <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <span className="font-medium text-white">{s.structured_formatting?.main_text || s.description}</span>
                                  {s.structured_formatting?.secondary_text && (
                                    <span className="text-gray-400 ml-1 text-xs">{s.structured_formatting.secondary_text}</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Show message when no drop-off results */}
                        {showDropoffSuggestions && dropoffSuggestions.length === 0 && dropoffLocation.length >= 2 && (
                          <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-white/10 rounded-xl shadow-xl p-3">
                            <p className="text-xs text-amber-400">No locations found. Try a nearby landmark or a more specific address.</p>
                          </div>
                        )}
                      </div>

                      {/* Date/Time Selection - Conditional based on mode */}
                      {bookingMode === 'within-city' ? (
                        /* Ride-hailing: ASAP or Scheduled */
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-300 block">When do you need the ride?</label>
                          
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setIsAsap(true)}
                              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                                isAsap 
                                  ? 'border-teal-500 bg-teal-500/10 text-white' 
                                  : 'border-white/10 bg-gray-800 text-gray-400 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="font-medium">Now</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAsap(false)}
                              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                                !isAsap 
                                  ? 'border-blue-500 bg-blue-500/10 text-white' 
                                  : 'border-white/10 bg-gray-800 text-gray-400 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Schedule</span>
                              </div>
                            </button>
                          </div>

                          {!isAsap && (
                            <div className="space-y-3">
                              <BookingCalendar
                                selectedDate={scheduledPickup ? scheduledPickup.slice(0, 10) : ''}
                                onDateSelect={(date) => {
                                  const time = scheduledPickup ? scheduledPickup.slice(11, 16) : '09:00'
                                  setScheduledPickup(`${date}T${time}`)
                                }}
                                unavailableDates={unavailableDates}
                                numberOfDays={1}
                                isLoading={isLoadingDates}
                                error={errors.scheduledPickup}
                              />
                              <div>
                                <label className="text-sm text-gray-400 mb-1 block">Pickup Time</label>
                                <input
                                  type="time"
                                  value={scheduledPickup ? scheduledPickup.slice(11, 16) : ''}
                                  onChange={(e) => {
                                    const date = scheduledPickup ? scheduledPickup.slice(0, 10) : new Date().toISOString().slice(0, 10)
                                    setScheduledPickup(`${date}T${e.target.value}`)
                                  }}
                                  className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                    errors.scheduledPickup ? 'border-red-500' : 'border-white/10'
                                  }`}
                                />
                              </div>
                            </div>
                          )}

                          {isAsap && (
                            <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-sm text-teal-300">Driver will be notified immediately after booking</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Rental or Auto: Date range selection */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">Select Pickup Date</label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Trip days:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setNumberOfDays(Math.max(1, numberOfDays - 1))}
                                  className="w-6 h-6 bg-gray-700 border border-white/10 rounded text-white hover:bg-gray-600 flex items-center justify-center text-xs font-bold transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-teal-400">{numberOfDays}</span>
                                <button
                                  type="button"
                                  onClick={() => setNumberOfDays(Math.min(30, numberOfDays + 1))}
                                  className="w-6 h-6 bg-gray-700 border border-white/10 rounded text-white hover:bg-gray-600 flex items-center justify-center text-xs font-bold transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          <BookingCalendar
                            selectedDate={pickupDate}
                            onDateSelect={(date) => setPickupDate(date)}
                            unavailableDates={unavailableDates}
                            numberOfDays={numberOfDays}
                            isLoading={isLoadingDates}
                            error={errors.pickupDate}
                          />

                          {pickupDate && (
                            <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-teal-300">
                                  {new Date(pickupDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  {numberOfDays > 1 && (
                                    <> → {new Date(computeEndDate(pickupDate, numberOfDays)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</>
                                  )}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-teal-400">
                                {numberOfDays === 1 ? '1 day' : `${numberOfDays} days`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Special Instructions */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Special Instructions (optional)</label>
                        <textarea
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="Any special requests or notes for the driver..."
                          rows={2}
                          className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Review & Fare */}
                  {step === 2 && priceBreakdown && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white mb-1">Review Your Trip</h3>
                      <p className="text-sm text-gray-400 mb-4">Confirm details before sending to the driver</p>

                      {/* Booking Type Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        finalBookingType === 'RIDE_HAILING' 
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {finalBookingType === 'RIDE_HAILING' ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Within City Ride
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            City to City Rental
                          </>
                        )}
                      </div>

                      {/* Route Summary */}
                      <div className="bg-gray-800/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <div className="w-0.5 h-8 bg-gray-600 my-1" />
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-xs text-gray-400">Pickup</p>
                              <p className="text-sm text-white font-medium break-words whitespace-normal leading-snug">{pickupLocation}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Drop-off</p>
                              <p className="text-sm text-white font-medium break-words whitespace-normal leading-snug">{dropoffLocation}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trip Info - Different for each booking type */}
                      <div className="grid grid-cols-3 gap-3">
                        {finalBookingType === 'RIDE_HAILING' ? (
                          <>
                            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                              <svg className="w-5 h-5 text-blue-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              <p className="text-lg font-bold text-white">{estimatedDistance}</p>
                              <p className="text-xs text-gray-400">km</p>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                              <svg className="w-5 h-5 text-teal-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-lg font-bold text-white">{estimatedDuration}</p>
                              <p className="text-xs text-gray-400">mins</p>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                              <svg className="w-5 h-5 text-cyan-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <p className="text-lg font-bold text-white">{car.car.seats}</p>
                              <p className="text-xs text-gray-400">Seats</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                              <svg className="w-5 h-5 text-teal-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-lg font-bold text-white">{tripDays}</p>
                              <p className="text-xs text-gray-400">Days</p>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                              <svg className="w-5 h-5 text-blue-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              <p className="text-lg font-bold text-white">{estimatedDistance}</p>
                              <p className="text-xs text-gray-400">km</p>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                              <svg className="w-5 h-5 text-cyan-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <p className="text-lg font-bold text-white">{car.car.seats}</p>
                              <p className="text-xs text-gray-400">Seats</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Dates/Time - Different for each booking type */}
                      {finalBookingType === 'RIDE_HAILING' ? (
                        <div className="bg-gray-800/60 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Pickup Time</p>
                            <p className="text-sm font-medium text-white">
                              {isAsap ? 'As soon as possible' : new Date(scheduledPickup || '').toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                          {surgeMultiplier > 1 && (
                            <div className="bg-orange-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <p className="text-sm font-bold text-orange-400">{surgeMultiplier.toFixed(1)}x surge</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-800/60 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Pickup Date</p>
                            <p className="text-sm font-medium text-white">{new Date(pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="bg-teal-500/20 px-3 py-1 rounded-full">
                            <p className="text-sm font-bold text-teal-400">{tripDays} day{tripDays !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Until</p>
                            <p className="text-sm font-medium text-white">{new Date(computeEndDate(pickupDate, numberOfDays)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      )}

                      {/* Price Breakdown - Different for each booking type */}
                      <div className="bg-gray-800/80 rounded-xl p-4 space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-2">Price Breakdown</h4>
                        {finalBookingType === 'RIDE_HAILING' ? (
                          <>
                            {(() => {
                              const base = priceBreakdown.base_fare ?? 0
                              const distance = priceBreakdown.distance_fare ?? 0
                              const time = priceBreakdown.time_fare ?? 0
                              const preSurgeSubtotal = base + distance + time
                              const surgeAmount = Math.max(
                                0,
                                (priceBreakdown.total_amount || 0) - (priceBreakdown.platform_fee || 0) - preSurgeSubtotal,
                              )
                              return (
                                <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Base Fare</span>
                              <span className="text-gray-200">PKR {(priceBreakdown.base_fare ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Distance ({estimatedDistance} km)</span>
                              <span className="text-gray-200">PKR {(priceBreakdown.distance_fare ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Time ({estimatedDuration} mins)</span>
                              <span className="text-gray-200">PKR {(priceBreakdown.time_fare ?? 0).toLocaleString()}</span>
                            </div>
                            {surgeMultiplier > 1 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-orange-400 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  Surge ({surgeMultiplier.toFixed(1)}x)
                                </span>
                                <span className="text-orange-400">PKR {surgeAmount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Platform Fee ({priceBreakdown.platform_fee_percentage ?? 15}%)</span>
                              <span className="text-gray-200">PKR {priceBreakdown.platform_fee.toLocaleString()}</span>
                            </div>
                                </>
                              )
                            })()}
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Base Price ({tripDays} days)</span>
                              <span className="text-gray-200">PKR {priceBreakdown.base_price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Distance ({estimatedDistance} km)</span>
                              <span className="text-gray-200">PKR {priceBreakdown.distance_price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Platform Fee ({priceBreakdown.platform_fee_percentage ?? 5}%)</span>
                              <span className="text-gray-200">PKR {priceBreakdown.platform_fee.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        <hr className="border-gray-700 my-1" />
                        <div className="flex justify-between font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-teal-400 text-lg">PKR {priceBreakdown.total_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {customerNotes && (
                        <div className="bg-gray-800/60 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Special Instructions</p>
                          <p className="text-sm text-gray-300">{customerNotes}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white mb-1">Payment Method</h3>
                      <p className="text-sm text-gray-400 mb-4">Choose how you'd like to pay. Wallet funds are held immediately for wallet bookings.</p>

                      {/* Payment Options */}
                      <div className="space-y-3">
                      {[
                          { id: 'wallet', label: 'Wallet (Recommended)', desc: 'Hold amount now; release to driver after completion + your approval', icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1zm8 4h.01" />
                          </svg>
                          )},
                          { id: 'cash', label: 'Cash', desc: 'Pay the driver in cash after trip completion', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )},
                          /* { id: 'online', label: 'Card (Stripe)', desc: 'Pay online after driver accepts', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          )}, */
                        ].map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                              paymentMethod === method.id
                                ? 'border-teal-500 bg-teal-500/10'
                                : 'border-white/10 bg-gray-800/60 hover:border-white/20'
                            }`}
                          >
                            <div className={`${paymentMethod === method.id ? 'text-teal-400' : 'text-gray-400'}`}>
                              {method.icon}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${paymentMethod === method.id ? 'text-white' : 'text-gray-300'}`}>{method.label}</p>
                              <p className="text-xs text-gray-400">{method.desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === method.id ? 'border-teal-500 bg-teal-500' : 'border-gray-600'
                            }`}>
                              {paymentMethod === method.id && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                        {paymentMethod === 'wallet' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
                          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-xs text-emerald-200">Your wallet balance will be checked and held immediately when you place the booking request. On rejection/cancellation, it is auto-refunded.</p>
                        </div>
                        )}

                      {/* Total Summary */}
                      {priceBreakdown && (
                        <div className="bg-gradient-to-r from-[#1e3a8a]/30 to-[#0d9488]/30 rounded-xl p-4 border border-teal-500/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-400">Total Amount</p>
                              <p className="text-2xl font-bold text-white">PKR {priceBreakdown.total_amount.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              {finalBookingType === 'RIDE_HAILING' ? (
                                <>
                                  <p className="text-xs text-gray-400">{estimatedDistance} km</p>
                                  <p className="text-xs text-gray-400">~{estimatedDuration} mins</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs text-gray-400">{tripDays} day{tripDays !== 1 ? 's' : ''}</p>
                                  <p className="text-xs text-gray-400">{estimatedDistance} km</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Driver Note */}
                      <div className="bg-gray-800/60 rounded-xl p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-gray-400">
                          {finalBookingType === 'RIDE_HAILING' 
                            ? 'Your request will be sent to the driver. Once accepted, the driver will arrive at your pickup location.'
                            : 'Your request will be sent to the driver. They\'ll review and respond within 24 hours. You can chat with them once they accept.'
                          }
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-white/10 flex items-center justify-between">
                {step > 0 && !(step === 1 && isSingleModeCar) ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={isCalculating}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white font-semibold py-2.5 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCalculating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Calculating...
                      </>
                    ) : (
                      <>
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white font-semibold py-2.5 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Send Booking Request
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
