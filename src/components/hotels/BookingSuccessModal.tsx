'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BookingResponse } from '@/lib/api/bookings.api'

const CheckCircleIcon = ({ className = 'w-16 h-16' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const XIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

interface BookingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingResponse | null
}

export function BookingSuccessModal({ isOpen, onClose, booking }: BookingSuccessModalProps) {
  if (!isOpen || !booking) return null

  const b = booking.booking

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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden border border-gray-700/50 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Header */}
          <div className="relative px-6 pt-8 pb-6 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            >
              <XIcon />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 mb-4"
            >
              <CheckCircleIcon className="w-12 h-12 text-teal-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-1"
            >
              Booking Confirmed!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm"
            >
              Your reservation has been successfully created
            </motion.p>
          </div>

          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-6 pb-6"
          >
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking ID</span>
                <span className="text-cyan-400 font-mono font-semibold">#{b.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Hotel</span>
                <span className="text-white font-medium">{b.hotel.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Room</span>
                <span className="text-white">{b.room_type.name} x{b.pricing.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Check-in</span>
                <span className="text-white">{b.dates.check_in}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Check-out</span>
                <span className="text-white">{b.dates.check_out}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{b.dates.nights} night{b.dates.nights !== 1 ? 's' : ''}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                <span className="text-gray-400">Total Paid</span>
                <span className="text-teal-400 font-bold text-lg">
                  PKR {b.pricing.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
