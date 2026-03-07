'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface DriverBookingItem {
  id: number
  status: string
  booking_type?: 'rental' | 'ride_hailing'
  customer: {
    name: string
  }
  car: {
    make: string
    model: string
  }
  start_date: string
  end_date: string
  driver_earnings: number
  created_at: string
  estimated_distance?: number
  pickup_location?: string
  dropoff_location?: string
}

interface DriverBookingsModalProps {
  isOpen: boolean
  onClose: () => void
  bookings: DriverBookingItem[]
}

export function DriverBookingsModal({ isOpen, onClose, bookings }: DriverBookingsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_DRIVER_ACCEPTANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-4 bg-gradient-to-r from-sky-700 via-cyan-700 to-emerald-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">My Car Bookings</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.map((booking) => {
                      const isRideHailing = booking.booking_type === 'ride_hailing'
                      const formatRideTime = (dateStr: string) => {
                        const date = new Date(dateStr)
                        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                      }
                      
                      return (
                      <div
                        key={booking.id}
                        className={`p-4 border rounded-xl hover:bg-gray-50 transition-colors flex justify-between items-start ${
                          isRideHailing ? 'border-teal-200 bg-teal-50/30' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="text-2xl">{isRideHailing ? '🚕' : '🚗'}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isRideHailing 
                                    ? 'bg-teal-100 text-teal-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {isRideHailing ? 'RIDE' : 'RENTAL'}
                                </span>
                                <p className="font-semibold text-gray-900">
                                  {booking.car.make} {booking.car.model}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600">
                                {booking.customer.name} • {isRideHailing 
                                  ? `Today ${formatRideTime(booking.start_date)}`
                                  : `${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}`
                                }
                              </p>
                              {isRideHailing && booking.estimated_distance && (
                                <p className="text-xs text-teal-600 mt-0.5">
                                  Est. {booking.estimated_distance} km
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Your Earning:{' '}
                            <span className={`font-bold ${isRideHailing ? 'text-teal-600' : 'text-green-600'}`}>
                              PKR {booking.driver_earnings.toLocaleString()}
                            </span>
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              booking.status,
                            )}`}
                          >
                            {booking.status.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🚗</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-6">
                      You have not received any car bookings yet. New bookings will appear here once clients request
                      your cars.
                    </p>
                    <Link href="/driver/bookings">
                      <span className="inline-flex items-center px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer">
                        View Bookings Page
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


