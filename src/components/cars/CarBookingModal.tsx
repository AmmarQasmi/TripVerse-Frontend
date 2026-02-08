'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CarApiResponse } from '@/types'
import { carsApi } from '@/lib/api/cars.api'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { RouteMap } from './RouteMap'
import { BookingCalendar } from './BookingCalendar'

interface CarBookingModalProps {
  isOpen: boolean
  onClose: () => void
  car: CarApiResponse
}

interface PriceBreakdown {
  base_price: number
  distance_price: number
  total_amount: number
  driver_earnings: number
  platform_fee: number
}

export default function CarBookingModal({ isOpen, onClose, car }: CarBookingModalProps) {
  const [step, setStep] = useState(1)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [numberOfDays, setNumberOfDays] = useState(1)
  const [customerNotes, setCustomerNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  
  // Autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([])
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false)
  const [pickupInputFocused, setPickupInputFocused] = useState(false)
  const [dropoffInputFocused, setDropoffInputFocused] = useState(false)
  
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

  // Compute end date from pickup date + number of days
  const computeEndDate = (startDate: string, days: number): string => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setPickupLocation('')
      setDropoffLocation('')
      setPickupDate('')
      setNumberOfDays(1)
      setCustomerNotes('')
      setPaymentMethod('cash')
      setPriceBreakdown(null)
      setEstimatedDistance(0)
      setTripDays(0)
      setErrors({})
      setPickupSuggestions([])
      setDropoffSuggestions([])
      setUnavailableDates([])
    }
  }, [isOpen])

  // Fetch unavailable dates when modal opens
  useEffect(() => {
    if (isOpen && car?.id) {
      setIsLoadingDates(true)
      carsApi.getUnavailableDates(car.id)
        .then(result => {
          setUnavailableDates(result.unavailable_dates || [])
        })
        .catch(() => {
          setUnavailableDates([])
        })
        .finally(() => setIsLoadingDates(false))
    }
  }, [isOpen, car?.id])

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

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!pickupLocation.trim()) newErrors.pickup = 'Pickup location is required'
    if (!dropoffLocation.trim()) newErrors.dropoff = 'Drop-off location is required'
    if (!pickupDate) newErrors.pickupDate = 'Pickup date is required'
    if (numberOfDays < 1 || numberOfDays > 30) newErrors.days = 'Days must be between 1 and 30'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return
      // Calculate price
      setIsCalculating(true)
      try {
        const endDate = computeEndDate(pickupDate, numberOfDays)
        const result = await carsApi.calculatePrice(
          car.id,
          pickupLocation,
          dropoffLocation,
          pickupDate,
          endDate
        )
        setPriceBreakdown(result.pricing_breakdown)
        setEstimatedDistance(result.estimated_distance)
        setTripDays(result.trip_duration_days)
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
      const endDate = computeEndDate(pickupDate, numberOfDays)
      await carsApi.createBookingRequest({
        car_id: parseInt(car.id),
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        start_date: pickupDate,
        end_date: endDate,
        customer_notes: customerNotes || undefined,
      })
      
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['car-bookings', 'user'] })
      
      onClose()
      showToast('Booking request sent to driver! You will be notified when they respond.', 'success')
      
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
                  <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        s < step ? 'bg-white text-[#1e3a8a]' : s === step ? 'bg-white text-[#1e3a8a] ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : 'bg-white/20 text-white/60'
                      }`}>
                        {s < step ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : s}
                      </div>
                      {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-white' : 'bg-white/20'}`} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/70">Route</span>
                  <span className="text-xs text-white/70">Review</span>
                  <span className="text-xs text-white/70">Payment</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {/* Step 1: Route Selection */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
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
                            placeholder="Enter drop-off location"
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
                      </div>

                      {/* Route Map Preview */}
                      <RouteMap
                        pickupLocation={pickupLocation}
                        dropoffLocation={dropoffLocation}
                      />

                      {/* Date & Days Selection */}
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
                              <p className="text-sm text-white font-medium truncate">{pickupLocation}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Drop-off</p>
                              <p className="text-sm text-white font-medium truncate">{dropoffLocation}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trip Info */}
                      <div className="grid grid-cols-3 gap-3">
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
                      </div>

                      {/* Dates */}
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

                      {/* Price Breakdown */}
                      <div className="bg-gray-800/80 rounded-xl p-4 space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-2">Price Breakdown</h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Base Price ({tripDays} days)</span>
                          <span className="text-gray-200">PKR {priceBreakdown.base_price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Distance ({estimatedDistance} km)</span>
                          <span className="text-gray-200">PKR {priceBreakdown.distance_price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Platform Fee (5%)</span>
                          <span className="text-gray-200">PKR {priceBreakdown.platform_fee.toLocaleString()}</span>
                        </div>
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
                      <p className="text-sm text-gray-400 mb-4">Choose how you'd like to pay after the driver accepts</p>

                      {/* Payment Options */}
                      <div className="space-y-3">
                        {[
                          { id: 'cash', label: 'Cash', desc: 'Pay the driver in cash', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )},
                          { id: 'card', label: 'Card Payment', desc: 'Pay securely with your card', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          )},
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

                      {/* Card payment coming soon note */}
                      {paymentMethod === 'card' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
                          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-xs text-yellow-200">Card payments are processed after the driver accepts your request. You'll be notified to complete payment.</p>
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
                              <p className="text-xs text-gray-400">{tripDays} day{tripDays !== 1 ? 's' : ''}</p>
                              <p className="text-xs text-gray-400">{estimatedDistance} km</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Driver Note */}
                      <div className="bg-gray-800/60 rounded-xl p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-gray-400">Your request will be sent to the driver. They'll review and respond within 24 hours. You can chat with them once they accept.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-white/10 flex items-center justify-between">
                {step > 1 ? (
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
