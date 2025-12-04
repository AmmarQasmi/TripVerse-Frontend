'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface BookingItem {
  id: number
  type: 'hotel' | 'car' | 'flight'
  name: string
  date: string
  status: string
  amount: number
  checkInDate?: string
  checkOutDate?: string
  startDate?: string
  endDate?: string
}

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: BookingItem[]
  totalAmount?: number
}

export function StatsModal({ isOpen, onClose, title, data, totalAmount }: StatsModalProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'checked_in':
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending_payment':
      case 'pending_driver_acceptance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
      case 'checked_out':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return '🏨'
      case 'car':
        return '🚗'
      case 'flight':
        return '✈️'
      default:
        return '📋'
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
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div
                className="relative px-6 py-4"
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #0d9488 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {data.length > 0 ? (
                  <div className="space-y-4">
                    {data.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group"
                      >
                        <Link href={item.type === 'hotel' ? `/client/hotelbookings/hotel/${item.id}` : `/client/cars/bookings`}>
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-2 border-transparent hover:border-blue-300 transition-all duration-300 p-5">
                            {/* Hover gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-teal-500/5 transition-all duration-300" />

                            <div className="relative z-10 flex items-center justify-between">
                              {/* Left: Icon + Info */}
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="text-4xl">{getTypeIcon(item.type)}</div>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {item.name}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {item.checkInDate || item.startDate
                                        ? `${formatDate(item.checkInDate || item.startDate)} - ${formatDate(item.checkOutDate || item.endDate || '')}`
                                        : formatDate(item.date)}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      ${item.amount?.toLocaleString() || '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Status Badge */}
                              <div className={`px-4 py-2 rounded-full text-xs font-semibold border ${getStatusColor(item.status)} whitespace-nowrap ml-4`}>
                                {item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4 flex justify-center">
                      <i className="fa-light fa-layer-group text-6xl text-gray-400"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No {title.toLowerCase()} found</h3>
                    <p className="text-gray-600 mb-6">
                      {title === 'Total Spent' 
                        ? 'You haven\'t made any bookings yet.'
                        : `You don't have any ${title.toLowerCase()} yet.`}
                    </p>
                    {/* Show Start Booking button only for specific booking types */}
                    {(title === 'Flight Booking' || title === 'Hotel Bookings' || title === 'Car Booking') && (
                      <Link href={
                        title === 'Flight Booking' ? '/client/flights' :
                        title === 'Hotel Bookings' ? '/client/hotels' :
                        title === 'Car Booking' ? '/client/cars' :
                        '/client/hotels'
                      }>
                        <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90">
                          Start Booking
                        </Button>
                      </Link>
                    )}
                    {/* For Total Trips and Total Spent, show different message */}
                    {(title === 'Total Trips' || title === 'Total Spent') && (
                      <div className="flex flex-col items-center space-y-4">
                        <p className="text-sm text-gray-500 max-w-md">
                          {title === 'Total Trips' 
                            ? 'Start planning your next adventure!'
                            : 'Begin your travel journey to see your spending here.'}
                        </p>
                        <Link href="/client/hotelbookings">
                          <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90 px-6 py-2">
                            View All Bookings
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Total Amount Summary (for Total Spent) */}
                {title === 'Total Spent' && data.length > 0 && totalAmount !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 pt-6 border-t-2 border-gray-200"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                      <span className="text-lg font-semibold text-gray-900">Total Amount Spent:</span>
                      <span className="text-2xl font-bold text-green-700">${totalAmount.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

