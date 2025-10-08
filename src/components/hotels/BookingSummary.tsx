'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Hotel, RoomType } from '@/types'

interface BookingSummaryProps {
  hotel: Hotel
  roomType: RoomType | undefined
  onClose: () => void
  onBooking: (data: any) => void
}

export function BookingSummary({ hotel, roomType, onClose, onBooking }: BookingSummaryProps) {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    onBooking({
      hotelId: hotel.id,
      roomTypeId: roomType?.id,
      ...bookingData
    })
    
    setIsProcessing(false)
  }

  const updateBookingData = (field: string, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    const checkInDate = new Date(bookingData.checkIn)
    const checkOutDate = new Date(bookingData.checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!roomType) return 0
    const nights = calculateNights()
    const basePrice = roomType.pricePerNight * nights * bookingData.rooms
    const taxes = basePrice * 0.15 // 15% taxes
    const serviceFee = basePrice * 0.05 // 5% service fee
    return basePrice + taxes + serviceFee
  }

  const nights = calculateNights()
  const total = calculateTotal()
  const basePrice = roomType ? roomType.pricePerNight * nights * bookingData.rooms : 0
  const taxes = basePrice * 0.15
  const serviceFee = basePrice * 0.05

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Complete Your Booking</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Details */}
            <div className="space-y-6">
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Booking Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hotel & Room
                    </label>
                    <div className="text-white">
                      <p className="font-semibold">{hotel.name}</p>
                      <p className="text-gray-300">{roomType?.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Check-in Date"
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => updateBookingData('checkIn', e.target.value)}
                      required
                    />
                    <Input
                      label="Check-out Date"
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => updateBookingData('checkOut', e.target.value)}
                      min={bookingData.checkIn}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Guests
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => updateBookingData('guests', Math.max(1, bookingData.guests - 1))}
                          className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-white w-8 text-center">{bookingData.guests}</span>
                        <button
                          type="button"
                          onClick={() => updateBookingData('guests', Math.min(10, bookingData.guests + 1))}
                          className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rooms
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => updateBookingData('rooms', Math.max(1, bookingData.rooms - 1))}
                          className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-white w-8 text-center">{bookingData.rooms}</span>
                        <button
                          type="button"
                          onClick={() => updateBookingData('rooms', Math.min(5, bookingData.rooms + 1))}
                          className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Guest Information</h3>
                
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={bookingData.guestName}
                    onChange={(e) => updateBookingData('guestName', e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={bookingData.guestEmail}
                    onChange={(e) => updateBookingData('guestEmail', e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={bookingData.guestPhone}
                    onChange={(e) => updateBookingData('guestPhone', e.target.value)}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => updateBookingData('specialRequests', e.target.value)}
                      placeholder="Any special requests or requirements..."
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-xl text-white placeholder-gray-400 focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-300"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-6">
              <div className="bg-gray-700/30 rounded-xl p-6 sticky top-0">
                <h3 className="text-xl font-bold text-white mb-4">Price Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Room rate ({nights} nights × {bookingData.rooms} rooms)</span>
                    <span>PKR {basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Taxes & fees (15%)</span>
                    <span>PKR {taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>TripVerse service fee (5%)</span>
                    <span>PKR {serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>PKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>✅ Free cancellation up to 24 hours before check-in</p>
                    <p>✅ Best price guarantee</p>
                    <p>✅ Instant confirmation</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e40af] hover:to-[#0f766e] text-white py-4 text-lg font-semibold"
                    disabled={!bookingData.checkIn || !bookingData.checkOut || !bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Pay PKR ${total.toLocaleString()}`
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
