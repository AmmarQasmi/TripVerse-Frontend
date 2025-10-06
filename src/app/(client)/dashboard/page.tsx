'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useUserHotelBookings } from '@/features/bookings/useHotelBooking'
import { useUserCarBookings } from '@/features/bookings/useCarBooking'
import { useAuth } from '@/features/auth/useAuth'

export default function ClientDashboard() {
  const { user } = useAuth()
  const { data: hotelBookings } = useUserHotelBookings()
  const { data: carBookings } = useUserCarBookings()

  const recentBookings = [
    ...(hotelBookings || []).slice(0, 3),
    ...(carBookings || []).slice(0, 3)
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

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
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Guest'}!
        </h1>
        <p className="text-lg text-gray-600">
          Manage your bookings and discover new travel experiences.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/(client)/hotels">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🏨</div>
              <h3 className="font-semibold text-gray-900">Find Hotels</h3>
              <p className="text-sm text-gray-600">Book your perfect stay</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/(client)/cars">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🚗</div>
              <h3 className="font-semibold text-gray-900">Rent Cars</h3>
              <p className="text-sm text-gray-600">Explore with your own wheels</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/(client)/monuments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="font-semibold text-gray-900">Monuments</h3>
              <p className="text-sm text-gray-600">Discover history with AI</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/(client)/weather">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🌤️</div>
              <h3 className="font-semibold text-gray-900">Weather</h3>
              <p className="text-sm text-gray-600">Plan your activities</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Bookings</CardTitle>
              <Link href="/(client)/bookings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {booking.hotel?.name || `${booking.car?.brand} ${booking.car?.model}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.hotel ? 'Hotel' : 'Car Rental'} • {formatDate(booking.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="font-semibold">${booking.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📋</div>
                <p>No bookings yet</p>
                <p className="text-sm">Start exploring to make your first booking</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Travel Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {hotelBookings?.length || 0}
                </div>
                <div className="text-sm text-blue-800">Hotel Bookings</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {carBookings?.length || 0}
                </div>
                <div className="text-sm text-green-800">Car Rentals</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {recentBookings.filter((b: any) => b.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-purple-800">Completed Trips</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  ${recentBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0)}
                </div>
                <div className="text-sm text-orange-800">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Tips */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Travel Tips & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🎒</div>
                <h3 className="font-semibold mb-2">Pack Smart</h3>
                <p className="text-sm text-gray-600">
                  Check the weather forecast before packing and bring layers for changing conditions.
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="font-semibold mb-2">Stay Connected</h3>
                <p className="text-sm text-gray-600">
                  Download offline maps and keep your booking confirmations handy on your phone.
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold mb-2">Explore Local</h3>
                <p className="text-sm text-gray-600">
                  Use our monument recognition feature to discover hidden historical gems.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
