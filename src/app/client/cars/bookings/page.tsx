'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUserBookings } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { ChatInterface } from '@/components/cars/ChatInterface'

export default function CarBookingsPage() {
  const { user, requireAuth, isAuthenticated } = useRequireAuth()
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  const { data: bookings, isLoading, error } = useUserBookings(statusFilter)

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-300 mb-8">
            Please login to view your car bookings.
          </p>
        </motion.div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_DRIVER_ACCEPTANCE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'ACCEPTED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'IN_PROGRESS':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'COMPLETED':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_DRIVER_ACCEPTANCE':
        return 'Waiting for Driver'
      case 'ACCEPTED':
        return 'Driver Accepted'
      case 'CONFIRMED':
        return 'Confirmed'
      case 'IN_PROGRESS':
        return 'Trip in Progress'
      case 'COMPLETED':
        return 'Completed'
      case 'CANCELLED':
        return 'Cancelled'
      case 'REJECTED':
        return 'Rejected'
      default:
        return status
    }
  }

  const canChat = (status: string) => {
    return ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Error Loading Bookings
          </h1>
          <p className="text-gray-300 mb-8">
            There was an error loading your bookings. Please try again.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">My Car Bookings</h1>
          <p className="text-gray-300">Manage your car rental bookings and communicate with drivers</p>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                statusFilter === ''
                  ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {['PENDING_DRIVER_ACCEPTANCE', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-6">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {booking.car.make} {booking.car.model} ({booking.car.year})
                      </h3>
                      <p className="text-gray-300">Driver: {booking.driver.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Pickup Location</p>
                      <p className="text-white">{booking.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Dropoff Location</p>
                      <p className="text-white">{booking.dropoff_location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Start Date</p>
                      <p className="text-white">{new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">End Date</p>
                      <p className="text-white">{new Date(booking.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Total Amount</p>
                      <p className="text-xl font-semibold text-white">
                        PKR {booking.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      {canChat(booking.status) && (
                        <button
                          onClick={() => setSelectedBooking(booking.id)}
                          className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          💬 Chat
                        </button>
                      )}
                      <button
                        onClick={() => {/* TODO: View details */}}
                        className="bg-gray-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-400 mb-6">
                  {statusFilter ? `No bookings with status "${getStatusText(statusFilter)}"` : 'You haven\'t made any car bookings yet'}
                </p>
                <button
                  onClick={() => window.location.href = '/client/cars'}
                  className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Browse Cars
                </button>
              </motion.div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1">
            {selectedBooking ? (
              <ChatInterface
                bookingId={selectedBooking}
                driverName="Driver"
                customerName={user?.full_name || 'Customer'}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a Booking
                </h3>
                <p className="text-gray-400">
                  Choose a booking from the list to start chatting with your driver
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
