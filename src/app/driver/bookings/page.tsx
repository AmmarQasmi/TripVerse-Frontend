'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDriverCarBookings } from '@/features/drivers/useDriverBookings'
import { carsApi } from '@/lib/api/cars.api'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { ChatInterface } from '@/components/cars/ChatInterface'

export default function DriverBookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING_DRIVER_ACCEPTANCE' | 'ACCEPTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'>('all')
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  
  const { bookings, isLoading } = useDriverCarBookings()

  // Auto-open chat from notification
  useEffect(() => {
    const openChatId = searchParams.get('openChat')
    if (openChatId && bookings && Array.isArray(bookings) && bookings.length > 0) {
      const bookingId = parseInt(openChatId, 10)
      const booking = bookings.find((b: any) => b.id === bookingId)
      if (booking && canChat(booking.status)) {
        setSelectedBooking(bookingId)
        // Remove query parameter from URL
        router.replace('/driver/bookings', { scroll: false })
      }
    }
  }, [searchParams, bookings, router])

  const canChat = (status: string) => {
    return ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  }

  const bookingsArray: any[] = Array.isArray(bookings) ? bookings : []
  const filteredBookings: any[] = bookingsArray.filter((booking: any) => 
    statusFilter === 'all' || booking.status === statusFilter
  )

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      await carsApi.respondToBooking(bookingId, 'accept')
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Booking accepted! Customer has been notified.', 'success')
    } catch (error: any) {
      console.error('Failed to accept booking:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to accept booking'
      showToast(errorMessage, 'error')
    }
  }

  const handleRejectBooking = async (bookingId: number) => {
    try {
      await carsApi.respondToBooking(bookingId, 'reject')
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Booking rejected. Customer has been notified.', 'info')
    } catch (error: any) {
      console.error('Failed to reject booking:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to reject booking'
      showToast(errorMessage, 'error')
    }
  }

  const handleStartTrip = async (bookingId: number) => {
    try {
      await carsApi.startTrip(bookingId)
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Trip started successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to start trip:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to start trip'
      showToast(errorMessage, 'error')
    }
  }

  const handleCompleteTrip = async (bookingId: number) => {
    try {
      await carsApi.completeTrip(bookingId)
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Trip completed successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to complete trip:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to complete trip'
      showToast(errorMessage, 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'PENDING_DRIVER_ACCEPTANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusActions = (booking: any) => {
    switch (booking.status) {
      case 'PENDING_DRIVER_ACCEPTANCE':
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => handleAcceptBooking(booking.id)}
              >
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRejectBooking(booking.id)}
              >
                Reject
              </Button>
            </div>
          </div>
        )
      case 'CONFIRMED':
        return (
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStartTrip(booking.id)}
            >
              Start Trip
            </Button>
            {canChat(booking.status) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedBooking(booking.id)}
              >
                💬 Chat
              </Button>
            )}
          </div>
        )
      case 'IN_PROGRESS':
        return (
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleCompleteTrip(booking.id)}
            >
              Complete Trip
            </Button>
            {canChat(booking.status) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedBooking(booking.id)}
              >
                💬 Chat
              </Button>
            )}
          </div>
        )
      case 'ACCEPTED':
        return (
          canChat(booking.status) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedBooking(booking.id)}
            >
              💬 Chat
            </Button>
          )
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="My Car Bookings"
        subtitle="Manage bookings for your cars and track your earnings"
        backUrl="/driver/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'PENDING_DRIVER_ACCEPTANCE', label: 'Pending' },
            { value: 'ACCEPTED', label: 'Accepted' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-gray-50">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking: any) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        {booking.car?.make || 'Car'} {booking.car?.model || ''}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Customer:</span> {booking.customer?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Pick-up:</span> {booking.start_date ? formatDate(booking.start_date) : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Return:</span> {booking.end_date ? formatDate(booking.end_date) : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Earnings:</span> PKR {(booking.driver_earnings || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Booking ID:</span> {booking.id}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Total Amount:</span> PKR {(booking.total_amount || 0).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Pickup:</span> {booking.pickup_location || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    {getStatusActions(booking)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">
                No bookings found
              </div>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? "You don't have any bookings yet."
                  : `No bookings with status "${statusFilter.replace(/_/g, ' ').toLowerCase()}".`
                }
              </p>
            </CardContent>
          </Card>
        )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-1">
          {selectedBooking ? (() => {
            const booking = bookingsArray.find((b: any) => b.id === selectedBooking)
            return (
              <ChatInterface
                key={selectedBooking}
                bookingId={selectedBooking}
                driverName="You"
                customerName={booking?.customer?.name || 'Customer'}
                onClose={() => setSelectedBooking(null)}
              />
            )
          })() : (
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">
                  Select a Booking
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose a booking from the list to start chatting with the customer
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

        {/* Summary Stats */}
        {Array.isArray(bookings) && bookings.length > 0 && (
          <Card className="mt-8 bg-white">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {bookings.length}
                  </div>
                  <div className="text-sm text-blue-800">Total Bookings</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {bookings.filter((b: any) => b.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-green-800">Completed</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {bookings.filter((b: any) => ['PENDING_DRIVER_ACCEPTANCE', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length}
                  </div>
                  <div className="text-sm text-yellow-800">Active</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    PKR {bookings
                      .filter((b: any) => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status))
                      .reduce((sum: number, b: any) => sum + (b.driver_earnings || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-800">Total Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
