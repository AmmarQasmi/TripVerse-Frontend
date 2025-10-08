'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useDriverCarBookings } from '@/features/drivers/useDriverBookings'

export default function DriverBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('all')
  
  const { bookings, isLoading, updateBookingStatus } = useDriverCarBookings()

  const filteredBookings = bookings?.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  ) || []

  const handleStatusUpdate = async (bookingId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED') => {
    try {
      await updateBookingStatus({ bookingId, status: newStatus })
    } catch (error) {
      console.error('Failed to update booking status:', error)
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
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusActions = (booking: any) => {
    switch (booking.status) {
      case 'PENDING':
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
            >
              Confirm
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
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
            onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
          >
            Mark Completed
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Car Bookings
        </h1>
        <p className="text-lg text-gray-600">
          Manage bookings for your cars and track your earnings.
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { value: 'all', label: 'All' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        {booking.car?.brand} {booking.car?.model}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Customer:</span> {booking.user?.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {booking.user?.email}
                      </div>
                      <div>
                        <span className="font-medium">Pick-up:</span> {formatDate(booking.startDate)}
                      </div>
                      <div>
                        <span className="font-medium">Return:</span> {formatDate(booking.endDate)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Booking ID:</span> {booking.id}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Duration:</span> {
                          Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))
                        } days
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Total Amount:</span> ${booking.totalAmount}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    {getStatusActions(booking)}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">
                📋 No bookings found
              </div>
              <p className="text-gray-400">
                {statusFilter === 'all' 
                  ? "You don't have any bookings yet."
                  : `No bookings with status "${statusFilter.toLowerCase()}".`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      {bookings && bookings.length > 0 && (
        <Card className="mt-8">
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
                  {bookings.filter(b => b.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-green-800">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length}
                </div>
                <div className="text-sm text-yellow-800">Active</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
                </div>
                <div className="text-sm text-purple-800">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
