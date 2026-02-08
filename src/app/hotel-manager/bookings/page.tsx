'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { hotelBookingsApi } from '@/lib/api/hotelBookings.api'

interface ManagerBooking {
  id: number
  status: string
  hotel: {
    id: number
    name: string
    city: string
  }
  room_type: {
    id: number
    name: string
  }
  customer: {
    id: number
    name: string
    email: string
  }
  dates: {
    check_in: string
    check_out: string
    nights: number
  }
  quantity: number
  total_amount: number
  manager_earnings: number
  currency: string
  created_at: string
}

export default function HotelManagerBookingsPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<'all' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'PENDING'>('all')
  const [bookings, setBookings] = useState<ManagerBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await hotelBookingsApi.getManagerBookings(statusFilter === 'all' ? undefined : statusFilter)
        setBookings(response.data || [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load bookings')
        console.error('Error fetching bookings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'hotel_manager') {
      fetchBookings()
    }
  }, [user, statusFilter])

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
      case 'CHECKED_IN':
      case 'CHECKED_OUT':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status)).length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    totalEarnings: bookings
      .filter(b => ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status))
      .reduce((sum, b) => sum + b.manager_earnings, 0),
  }

  if (isLoading) {
    return <PageLoader message="Loading bookings..." variant="skeleton" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="My Bookings"
          subtitle="Manage your hotel bookings"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="My Bookings"
        subtitle="Manage your hotel bookings"
        backUrl="/hotel-manager/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-gray-600 text-sm mt-1">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stats.confirmed}</div>
                <div className="text-gray-600 text-sm mt-1">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stats.cancelled}</div>
                <div className="text-gray-600 text-sm mt-1">Cancelled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">PKR {stats.totalEarnings.toLocaleString()}</div>
                <div className="text-gray-600 text-sm mt-1">Total Earnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Status Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(['all', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'PENDING'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {/* Bookings List */}
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
                  <p className="text-gray-600">
                    {statusFilter === 'all' 
                      ? 'You don\'t have any bookings yet.' 
                      : `No bookings with status "${statusFilter}"`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold">{booking.hotel.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-semibold">Room Type:</span> {booking.room_type.name}
                            </div>
                            <div>
                              <span className="font-semibold">Quantity:</span> {booking.quantity} room(s)
                            </div>
                            <div>
                              <span className="font-semibold">Check-in:</span> {formatDate(booking.dates.check_in)}
                            </div>
                            <div>
                              <span className="font-semibold">Check-out:</span> {formatDate(booking.dates.check_out)}
                            </div>
                            <div>
                              <span className="font-semibold">Nights:</span> {booking.dates.nights}
                            </div>
                            <div>
                              <span className="font-semibold">Customer:</span> {booking.customer.name}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                        <div>
                          <p className="text-gray-600 text-sm">Total Amount</p>
                          <p className="text-2xl font-bold">PKR {booking.total_amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-sm">Your Earnings (95%)</p>
                          <p className="text-xl font-bold text-green-600">PKR {booking.manager_earnings.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

