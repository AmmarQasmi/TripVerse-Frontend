'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserHotelBookings } from '@/features/bookings/useHotelBooking'
import { useUserCarBookings } from '@/features/bookings/useCarBooking'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'hotel' | 'car'>('all')
  
  const { data: hotelBookings, isLoading: hotelLoading } = useUserHotelBookings()
  const { data: carBookings, isLoading: carLoading } = useUserCarBookings()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredBookings = () => {
    if (activeTab === 'hotel') return hotelBookings || []
    if (activeTab === 'car') return carBookings || []
    return [...(hotelBookings || []), ...(carBookings || [])]
  }

  const bookings = filteredBookings()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          My Bookings
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('hotel')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'hotel'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hotels ({hotelBookings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('car')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'car'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cars ({carBookings?.length || 0})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {(hotelLoading || carLoading) ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : bookings.length > 0 ? (
          bookings.map((booking: any) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-semibold">
                        {booking.hotel?.name || `${booking.car?.brand} ${booking.car?.model}`}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Booking ID:</span> {booking.id}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {booking.hotel ? 'Hotel' : 'Car Rental'}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> ${booking.totalAmount}
                      </div>
                      {booking.hotel ? (
                        <>
                          <div>
                            <span className="font-medium">Check-in:</span> {formatDate(booking.checkInDate)}
                          </div>
                          <div>
                            <span className="font-medium">Check-out:</span> {formatDate(booking.checkOutDate)}
                          </div>
                          <div>
                            <span className="font-medium">Guests:</span> {booking.guests}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium">Pick-up:</span> {formatDate(booking.startDate)}
                          </div>
                          <div>
                            <span className="font-medium">Return:</span> {formatDate(booking.endDate)}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {booking.car?.location}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Cancel
                      </Button>
                    ) : null}
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
              <p className="text-gray-400 mb-6">
                {activeTab === 'all' 
                  ? "You haven't made any bookings yet."
                  : activeTab === 'hotel'
                  ? "You haven't booked any hotels yet."
                  : "You haven't rented any cars yet."
                }
              </p>
              <Button>
                {activeTab === 'hotel' ? 'Browse Hotels' : activeTab === 'car' ? 'Browse Cars' : 'Start Exploring'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
