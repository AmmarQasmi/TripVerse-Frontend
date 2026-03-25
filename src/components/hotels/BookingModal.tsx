'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressStepper } from './ProgressStepper'
import { HotelBookingCalendar } from './HotelBookingCalendar'
import { useRoomAvailability } from '@/features/hotels/useHotelSearch'
import { useCreateBooking } from '@/features/bookings/useBooking'
import { bookingsApi } from '@/lib/api/bookings.api'
import { paymentsApi } from '@/lib/api/payments.api'
import { Hotel } from '@/types'
import { BookingResponse } from '@/lib/api/bookings.api'
import { BookingCalendar } from '@/components/cars/BookingCalendar'
import Link from 'next/link'

// --- SVG Icons ---
const XIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const UsersIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
)

const CalendarIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const CheckCircleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const CreditCardIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
)

const BanknotesIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
)

const SpinnerIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

const ChevronLeftIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRightIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

interface BookingModalProps {
  hotel: Hotel
  isOpen: boolean
  onClose: () => void
  onSuccess: (booking: BookingResponse) => void
  searchDates?: {
    checkIn: string
    checkOut: string
    guests: number
    rooms: number
  }
}

const STEPS = [
  { label: 'Room Selection' },
  { label: 'Review & Guest Info' },
  { label: 'Payment' },
]

const TAX_RATE = 0.15
const SERVICE_FEE_RATE = 0.05

export function BookingModal({ hotel, isOpen, onClose, onSuccess, searchDates }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null)
  const [quantity, setQuantity] = useState(searchDates?.rooms || 1)
  const [checkIn, setCheckIn] = useState(searchDates?.checkIn || '')
  const [checkOut, setCheckOut] = useState(searchDates?.checkOut || '')

  // Guest info
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('wallet')
  const [cashPolicyAcknowledged, setCashPolicyAcknowledged] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Card info
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [showExpiryCalendar, setShowExpiryCalendar] = useState(false)
  const [expiryYearView, setExpiryYearView] = useState(new Date().getFullYear())
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Unavailable dates for selected room type
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [isLoadingDates, setIsLoadingDates] = useState(false)

  const createBooking = useCreateBooking()

  // Pre-fill dates from search params
  useEffect(() => {
    if (searchDates) {
      if (searchDates.checkIn) setCheckIn(searchDates.checkIn)
      if (searchDates.checkOut) setCheckOut(searchDates.checkOut)
      if (searchDates.rooms > 0) setQuantity(searchDates.rooms)
    }
  }, [searchDates])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('[data-calendar-container]')) return
      setShowExpiryCalendar(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch unavailable dates when a room type is selected
  const fetchUnavailableDates = useCallback(async (roomTypeId: string) => {
    if (!hotel.id) return
    setIsLoadingDates(true)
    try {
      const data = await bookingsApi.getRoomUnavailableDates(hotel.id.toString(), roomTypeId)
      setUnavailableDates(data.unavailable_dates || [])
    } catch (err) {
      console.error('Failed to fetch unavailable dates:', err)
      setUnavailableDates([])
    } finally {
      setIsLoadingDates(false)
    }
  }, [hotel.id])

  // Fetch room availability
  const { data: availability, isLoading: availabilityLoading } = useRoomAvailability(
    hotel.id?.toString() || '',
    checkIn,
    checkOut,
  )

  const roomTypes = availability?.roomTypes || []

  // Pricing calculation
  const pricing = useMemo(() => {
    if (!selectedRoomType || !checkIn || !checkOut) return null

    const checkinDate = new Date(checkIn)
    const checkoutDate = new Date(checkOut)
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) return null

    const basePrice = selectedRoomType.pricePerNight
    const subtotal = basePrice * quantity * nights
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100
    const total = Math.round((subtotal + taxAmount + serviceFee) * 100) / 100

    return { basePrice, nights, subtotal, taxAmount, serviceFee, total }
  }, [selectedRoomType, quantity, checkIn, checkOut])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setSelectedRoomType(null)
      setGuestName('')
      setGuestEmail('')
      setGuestPhone('')
      setSpecialRequests('')
      setAgreedToTerms(false)
      setCashPolicyAcknowledged(false)
      setCardNumber('')
      setCardExpiry('')
      setCardCvv('')
      setCardName('')
      setUnavailableDates([])
      setBookingError(null)
      createBooking.reset()
    }
  }, [isOpen])

  const showShortNoticeCancellationWarning = useMemo(() => {
    if (!checkIn) return false

    const checkInDate = new Date(`${checkIn}T00:00:00`)
    if (isNaN(checkInDate.getTime())) return false

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = checkInDate.getTime() - todayStart.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    return diffDays === 0 || diffDays === 1
  }, [checkIn])

  const canProceedStep0 = selectedRoomType && checkIn && checkOut && quantity > 0
  const canProceedStep1 = guestName.trim().length > 0
  const isCardValid = true
  const cashPolicyValid = paymentMethod !== 'cash' || cashPolicyAcknowledged
  const canProceedStep2 = agreedToTerms && cashPolicyValid && isCardValid && !createBooking.isPending

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16)
    const parts = v.match(/.{1,4}/g)
    return parts ? parts.join(' ') : v
  }

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2)
    return v
  }

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1)
  }
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleConfirmBooking = async () => {
    if (!selectedRoomType || !pricing) return

    try {
      setBookingError(null)

      if (paymentMethod === 'wallet') {
        const wallet = await paymentsApi.getWalletBalance()
        const availablePaisa = BigInt(wallet.available)
        const requiredPaisa = BigInt(Math.round(pricing.total * 100))

        if (availablePaisa < requiredPaisa) {
          setBookingError('Insufficient wallet balance. Please top up your balance.')
          return
        }
      }

      const response = await createBooking.mutateAsync({
        hotel_id: parseInt(hotel.id),
        room_type_id: parseInt(selectedRoomType.id),
        quantity,
        check_in: checkIn,
        check_out: checkOut,
        guest_name: guestName,
        guest_email: guestEmail || undefined,
        guest_phone: guestPhone || undefined,
        special_requests: specialRequests || undefined,
        payment_method: paymentMethod,
        cash_policy_acknowledged: paymentMethod === 'cash' ? cashPolicyAcknowledged : undefined,
      })
      onSuccess(response)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        (createBooking.error as any)?.response?.data?.message ||
        createBooking.error?.message ||
        'Booking failed. Please try again.'
      setBookingError(message)
      console.error('Booking failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700/50 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Book {hotel.name}</h2>
              <p className="text-sm text-gray-400">{hotel.location}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            >
              <XIcon />
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="px-6 py-4 border-b border-gray-800/50">
            <ProgressStepper steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
            <AnimatePresence mode="wait">
              {/* Step 0: Room Selection */}
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Date Selection Calendar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Your Dates</label>
                    <HotelBookingCalendar
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onCheckInSelect={(date) => {
                        setCheckIn(date)
                        setSelectedRoomType(null)
                      }}
                      onCheckOutSelect={(date) => {
                        setCheckOut(date)
                        setSelectedRoomType(null)
                      }}
                      unavailableDates={unavailableDates}
                      isLoading={isLoadingDates}
                    />

                    {showShortNoticeCancellationWarning && (
                      <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2">
                        <p className="text-sm text-amber-200">
                          Warning: You will not be able to cancel this booking if check-in is today or tomorrow.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Number of Rooms</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center text-lg"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="w-9 h-9 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Room Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Select Room Type</label>
                    {!checkIn || !checkOut ? (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Select dates to see available rooms</p>
                      </div>
                    ) : availabilityLoading ? (
                      <div className="text-center py-8 text-gray-400">
                        <SpinnerIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Checking availability...</p>
                      </div>
                    ) : roomTypes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No room types available for these dates</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {roomTypes.map((room: any) => {
                          const isSelected = selectedRoomType?.id === room.id
                          const hasEnough = room.availableRooms >= quantity
                          const isDisabled = !room.isAvailable || !hasEnough

                          return (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => {
                                if (!isDisabled) {
                                  setSelectedRoomType(room)
                                  fetchUnavailableDates(room.id.toString())
                                }
                              }}
                              disabled={isDisabled}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? 'border-cyan-500 bg-cyan-500/10'
                                  : isDisabled
                                  ? 'border-gray-700/50 bg-gray-800/30 opacity-50 cursor-not-allowed'
                                  : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600 cursor-pointer'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-white">{room.name}</h4>
                                    {isSelected && <CheckCircleIcon className="w-5 h-5 text-cyan-400" />}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <UsersIcon className="w-3.5 h-3.5" />
                                      Up to {room.capacity} guests
                                    </span>
                                    <span>
                                      {room.availableRooms} room{room.availableRooms !== 1 ? 's' : ''} left
                                    </span>
                                  </div>
                                  {room.amenities && room.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {room.amenities.slice(0, 4).map((a: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-gray-700/50 rounded-full text-xs text-gray-300">
                                          {a}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-lg font-bold text-white">
                                    PKR {room.pricePerNight.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-400">per night</p>
                                  {room.nights > 0 && (
                                    <p className="text-xs text-cyan-400 mt-1">
                                      PKR {(room.pricePerNight * quantity * room.nights).toLocaleString()} total
                                    </p>
                                  )}
                                </div>
                              </div>
                              {isDisabled && room.availableRooms > 0 && !hasEnough && (
                                <p className="text-xs text-amber-400 mt-2">
                                  Only {room.availableRooms} available — reduce quantity to book
                                </p>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Review & Guest Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Booking Summary */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hotel</span>
                        <span className="text-white font-medium">{hotel.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Room Type</span>
                        <span className="text-white">{selectedRoomType?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dates</span>
                        <span className="text-white">{checkIn} → {checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">{pricing?.nights} night{pricing?.nights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rooms</span>
                        <span className="text-white">{quantity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Guest Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Enter guest name"
                          className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Email</label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="guest@email.com"
                            className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="+92 300 1234567"
                            className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Special Requests</label>
                        <textarea
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Any special requirements (e.g., early check-in, extra bed)..."
                          rows={3}
                          className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Price Breakdown */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Price Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          PKR {selectedRoomType?.pricePerNight?.toLocaleString()} x {quantity} room{quantity > 1 ? 's' : ''} x {pricing?.nights} night{(pricing?.nights || 0) > 1 ? 's' : ''}
                        </span>
                        <span className="text-white">PKR {pricing?.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tax (15%)</span>
                        <span className="text-white">PKR {pricing?.taxAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service Fee (5%)</span>
                        <span className="text-white">PKR {pricing?.serviceFee?.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-white">Total</span>
                        <span className="font-bold text-lg text-cyan-400">PKR {pricing?.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Payment Method</h3>
                    <div className="space-y-2">
                      {/* <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <CreditCardIcon className="w-5 h-5 text-gray-300" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">Credit / Debit Card</p>
                          <p className="text-xs text-gray-400">Simulated payment — no charges</p>
                        </div>
                        {paymentMethod === 'card' && (
                          <CheckCircleIcon className="w-5 h-5 text-cyan-400 ml-auto" />
                        )}
                      </button> */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('wallet')
                          setBookingError(null)
                        }}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          paymentMethod === 'wallet'
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <CreditCardIcon className="w-5 h-5 text-gray-300" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">Wallet</p>
                          <p className="text-xs text-gray-400">Uses available wallet balance</p>
                        </div>
                        {paymentMethod === 'wallet' && (
                          <CheckCircleIcon className="w-5 h-5 text-cyan-400 ml-auto" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('cash')
                          setBookingError(null)
                        }}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <BanknotesIcon className="w-5 h-5 text-gray-300" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">Pay at Hotel</p>
                          <p className="text-xs text-gray-400">Pay cash during check-in</p>
                        </div>
                        {paymentMethod === 'cash' && (
                          <CheckCircleIcon className="w-5 h-5 text-cyan-400 ml-auto" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Details (shown when card is selected) */}
                  {false && paymentMethod === 'wallet' && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Card Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Name on Card *</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Card Number *</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                              className="w-full px-3 py-2.5 pl-10 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm tracking-wider"
                            />
                            <CreditCardIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative" data-calendar-container>
                            <label className="block text-sm text-gray-400 mb-1">Expiry *</label>
                            <div className="relative">
                              <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                              <button
                                type="button"
                                onClick={() => setShowExpiryCalendar(prev => !prev)}
                                className={`w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-left focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm tracking-wider ${
                                  cardExpiry ? 'text-white' : 'text-gray-500'
                                }`}
                              >
                                {cardExpiry || 'MM/YY'}
                              </button>
                              <CalendarIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>

                            {showExpiryCalendar && (
                              <div className="absolute bottom-full left-0 mb-2 z-50 w-[320px] max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setExpiryYearView(prev => prev - 1) }}
                                    className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                  >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                  </button>
                                  <span className="text-white font-semibold">{expiryYearView}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setExpiryYearView(prev => prev + 1) }}
                                    className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                  >
                                    <ChevronRightIcon className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {Array.from({ length: 12 }).map((_, i) => {
                                    const monthStr = (i + 1).toString().padStart(2, '0');
                                    const yearStr = expiryYearView.toString().slice(2);
                                    const isSelected = cardExpiry === `${monthStr}/${yearStr}`;
                                    
                                    const currentYear = new Date().getFullYear();
                                    const currentMonth = new Date().getMonth() + 1;
                                    const isPast = expiryYearView < currentYear || (expiryYearView === currentYear && i + 1 < currentMonth);

                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        disabled={isPast}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardExpiry(`${monthStr}/${yearStr}`);
                                          setShowExpiryCalendar(false);
                                        }}
                                        className={`p-2 rounded-lg text-sm transition-all focus:outline-none ${
                                          isSelected
                                            ? 'bg-cyan-500 text-white font-medium'
                                            : isPast
                                            ? 'text-gray-600 cursor-not-allowed opacity-50'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`}
                                      >
                                        {new Date(2000, i).toLocaleString('default', { month: 'short' })}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">CVV *</label>
                            <input
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm tracking-wider"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                          This is a simulated payment — no real charges will be made
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-amber-600/30 bg-amber-900/10">
                      <input
                        type="checkbox"
                        checked={cashPolicyAcknowledged}
                        onChange={(e) => setCashPolicyAcknowledged(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-amber-200">
                        I acknowledge the cash booking policy: cancellation is only allowed before 1 day prior to check-in and cash cancellation applies a 25% debt.
                      </span>
                    </label>
                  )}

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      I agree to the booking <Link href="/terms/hotel-booking" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">terms and conditions</Link>. I understand that this is a simulated payment and no actual charges will be made.
                    </span>
                  </label>

                  {/* Error */}
                  {(bookingError || createBooking.isError) && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                      {bookingError || (createBooking.error as any)?.response?.data?.message || createBooking.error?.message || 'Booking failed. Please try again.'}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700/50 flex items-center justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {pricing && (
                <span className="text-sm text-gray-400">
                  Total: <span className="text-cyan-400 font-semibold">PKR {pricing.total.toLocaleString()}</span>
                </span>
              )}

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 0 ? !canProceedStep0 : !canProceedStep1}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={!canProceedStep2}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createBooking.isPending ? (
                    <>
                      <SpinnerIcon className="w-4 h-4" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
