'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDriverCarBookings } from '@/features/drivers/useDriverBookings'
import { carsApi } from '@/lib/api/cars.api'

export default function DriverBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING_DRIVER_ACCEPTANCE' | 'ACCEPTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'>('all')
  
  const { bookings, isLoading } = useDriverCarBookings()

  const bookingsArray: any[] = Array.isArray(bookings) ? bookings : []
  const filteredBookings: any[] = bookingsArray.filter((booking: any) => 
    statusFilter === 'all' || booking.status === statusFilter
  )

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      await carsApi.respondToBooking(bookingId, 'accept')
      window.location.reload()
    } catch (error) {
      console.error('Failed to accept booking:', error)
      alert('Failed to accept booking')
    }
  }

  const handleRejectBooking = async (bookingId: number) => {
    try {
      await carsApi.respondToBooking(bookingId, 'reject')
      window.location.reload()
    } catch (error) {
      console.error('Failed to reject booking:', error)
      alert('Failed to reject booking')
    }
  }

  const handleStartTrip = async (bookingId: number) => {
    try {
      await carsApi.startTrip(bookingId)
      window.location.reload()
    } catch (error) {
      console.error('Failed to start trip:', error)
      alert('Failed to start trip')
    }
  }

  const handleCompleteTrip = async (bookingId: number) => {
    try {
      await carsApi.completeTrip(bookingId)
      window.location.reload()
    } catch (error) {
      console.error('Failed to complete trip:', error)
      alert('Failed to complete trip')
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
        )
      case 'CONFIRMED':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleStartTrip(booking.id)}
          >
            Start Trip
          </Button>
        )
      case 'IN_PROGRESS':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleCompleteTrip(booking.id)}
          >
            Complete Trip
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title="My Bookings"
        subtitle="Manage your car rental bookings"
        backUrl="/driver/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
          My Car Bookings
        </h1>
        <p className="text-lg text-gray-600">
          Manage bookings for your cars and track your earnings.
        </p>
      </div>

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
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-white/10">
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
                        <span className="font-medium">Earnings:</span> ${booking.driver_earnings || 0}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Booking ID:</span> {booking.id}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Total Amount:</span> ${booking.total_amount || 0}
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
                📋 No bookings found
              </div>
              <p className="text-gray-400">
                {statusFilter === 'all' 
                  ? "You don't have any bookings yet."
                  : `No bookings with status "${statusFilter.replace(/_/g, ' ').toLowerCase()}".`
                }
              </p>
            </CardContent>
          </Card>
        )}
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
                    ${bookings.reduce((sum: number, b: any) => sum + (b.driver_earnings || 0), 0).toFixed(2)}
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
