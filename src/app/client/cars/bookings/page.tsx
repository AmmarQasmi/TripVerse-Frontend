'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserBookings } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { ChatInterface } from '@/components/cars/ChatInterface'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function CarBookingsPage() {
  const { user, requireAuth, isAuthenticated } = useRequireAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [selectedBookingData, setSelectedBookingData] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  const { data: bookings, isLoading, error } = useUserBookings(statusFilter)

  const canChat = (status: string) => {
    return ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  }

  // Auto-open chat from notification
  useEffect(() => {
    const openChatId = searchParams.get('openChat')
    if (openChatId && bookings && bookings.length > 0) {
      const bookingId = parseInt(openChatId, 10)
      const booking = bookings.find((b: any) => b.id === bookingId)
      if (booking && canChat(booking.status)) {
        setSelectedBooking(bookingId)
        setSelectedBookingData(booking)
        // Remove query parameter from URL
        router.replace('/client/cars/bookings', { scroll: false })
      }
    }
  }, [searchParams, bookings, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Login Required
            </h1>
            <p className="text-gray-600 mb-8">
              Please login to view your car bookings.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_DRIVER_ACCEPTANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const handleConfirmBooking = (bookingId: number) => {
    router.push(`/client/cars/booking/confirm?bookingId=${bookingId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="My Car Bookings"
          subtitle="Manage your car rental bookings and communicate with drivers"
          backUrl="/client/dashboard"
          backLabel="Back to Dashboard"
        />
        <PageLoader message="Loading bookings..." variant="skeleton" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="My Car Bookings"
          subtitle="Manage your car rental bookings and communicate with drivers"
          backUrl="/client/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Error Loading Bookings
            </h1>
            <p className="text-gray-600 mb-8">
              There was an error loading your bookings. Please try again.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="My Car Bookings"
        subtitle="Manage your car rental bookings and communicate with drivers"
        backUrl="/client/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">

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
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-75 ${
                statusFilter === ''
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All
            </button>
            {['PENDING_DRIVER_ACCEPTANCE', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-75 ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.car.make} {booking.car.model} ({booking.car.year})
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Driver: {booking.driver.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Pickup Location:</span> {booking.pickup_location}
                        </div>
                        <div>
                          <span className="font-medium">Dropoff Location:</span> {booking.dropoff_location}
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span> {new Date(booking.start_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div>
                          <span className="font-medium">End Date:</span> {new Date(booking.end_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div>
                          <span className="font-medium">Total Amount:</span> PKR {booking.total_amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        {booking.status === 'ACCEPTED' && (
                          <Link href={`/client/cars/booking/confirm?bookingId=${booking.id}`}>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                              ✅ Confirm & Pay
                            </Button>
                          </Link>
                        )}
                        {canChat(booking.status) && (
                          <Button
                            onClick={() => {
                              setSelectedBooking(booking.id)
                              setSelectedBookingData(booking)
                            }}
                            className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90"
                            size="sm"
                          >
                            💬 Chat
                          </Button>
                        )}
                        <Button
                          onClick={() => {/* TODO: View details */}}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter ? `No bookings with status "${getStatusText(statusFilter)}"` : 'You haven\'t made any car bookings yet'}
                  </p>
                  <Link href="/client/cars">
                    <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90">
                      Browse Cars
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1">
            {selectedBooking && selectedBookingData ? (
              <ChatInterface
                bookingId={selectedBooking}
                driverName={selectedBookingData.driver?.name || 'Driver'}
                customerName={user?.full_name || 'Customer'}
                onClose={() => {
                  setSelectedBooking(null)
                  setSelectedBookingData(null)
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Booking
                  </h3>
                  <p className="text-gray-600">
                    Choose a booking from the list to start chatting with your driver
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
