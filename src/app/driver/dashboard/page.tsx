'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useAuth } from '@/features/auth/useAuth'

export default function DriverDashboard() {
  const { user } = useAuth()

  // Mock data - replace with actual API calls
  const stats = {
    totalEarnings: 2450,
    completedTrips: 23,
    activeBookings: 3,
    rating: 4.8,
  }

  const recentBookings = [
    {
      id: '1',
      car: 'Toyota Camry 2022',
      customer: 'John Doe',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      amount: 180,
      status: 'CONFIRMED',
    },
    {
      id: '2',
      car: 'Honda Civic 2021',
      customer: 'Jane Smith',
      startDate: '2024-01-12',
      endDate: '2024-01-14',
      amount: 150,
      status: 'COMPLETED',
    },
  ]

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Driver Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome back, {user?.name || 'Driver'}! Manage your car rentals and earnings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
              <div className="text-2xl">🚗</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating} ⭐</p>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/(driver)/cars">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🚗</div>
              <h3 className="font-semibold text-gray-900">Manage Cars</h3>
              <p className="text-sm text-gray-600">Add or update your vehicles</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/(driver)/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-900">Bookings</h3>
              <p className="text-sm text-gray-600">View and manage bookings</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/(driver)/payouts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-semibold text-gray-900">Payouts</h3>
              <p className="text-sm text-gray-600">Track your earnings</p>
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
              <Link href="/(driver)/bookings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{booking.car}</div>
                    <div className="text-sm text-gray-600">
                      {booking.customer} • {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="font-semibold">${booking.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600">Earnings chart will be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">
                Track your weekly and monthly earnings trends
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
