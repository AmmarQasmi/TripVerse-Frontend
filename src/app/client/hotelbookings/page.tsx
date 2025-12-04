'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserHotelBookings } from '@/features/bookings/useHotelBooking'

export default function BookingsPage() {
  const { data: hotelBookings, isLoading: hotelLoading } = useUserHotelBookings()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
      case 'PENDING_DRIVER_ACCEPTANCE':
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
      case 'CHECKED_OUT':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
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

  const bookings = hotelBookings || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          My Hotels
        </h1>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {hotelLoading ? (
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
                        {booking.hotel?.name || 'Hotel Booking'}
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
                        <span className="font-medium">Type:</span> Hotel
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> PKR {booking.total_amount?.toLocaleString() || booking.totalAmount?.toLocaleString() || '0'}
                      </div>
                      <div>
                        <span className="font-medium">Check-in:</span> {formatDate(booking.dates?.check_in || booking.check_in || booking.checkInDate || '')}
                      </div>
                      <div>
                        <span className="font-medium">Check-out:</span> {formatDate(booking.dates?.check_out || booking.check_out || booking.checkOutDate || '')}
                      </div>
                      <div>
                        <span className="font-medium">Rooms:</span> {booking.quantity || 1}
                      </div>
                      {booking.dates?.nights && (
                        <div>
                          <span className="font-medium">Nights:</span> {booking.dates.nights}
                        </div>
                      )}
                      {booking.room_type && (
                        <div>
                          <span className="font-medium">Room Type:</span> {booking.room_type.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link href={`/client/hotelbookings/hotel/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {booking.status === 'PENDING_PAYMENT' && (
                      <Link href={`/client/hotels/booking/confirm?bookingId=${booking.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                          ✅ Confirm & Pay
                        </Button>
                      </Link>
                    )}
                    {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-2">Contact Hotel:</p>
                        {booking.hotel?.email && (
                          <a 
                            href={`mailto:${booking.hotel.email}`} 
                            className="text-xs text-blue-600 hover:text-blue-800 block mb-1"
                          >
                            ✉️ {booking.hotel.email}
                          </a>
                        )}
                        {booking.hotel?.phone && (
                          <a 
                            href={`tel:${booking.hotel.phone}`} 
                            className="text-xs text-blue-600 hover:text-blue-800 block"
                          >
                            📱 {booking.hotel.phone}
                          </a>
                        )}
                        {!booking.hotel?.email && !booking.hotel?.phone && (
                          <p className="text-xs text-gray-500">Contact information not available</p>
                        )}
                      </div>
                    )}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT') && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Cancel
                      </Button>
                    )}
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
                You haven't booked any hotels yet.
              </p>
              <Button>
                Browse Hotels
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

