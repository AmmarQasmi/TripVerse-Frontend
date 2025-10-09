'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'

interface DriverCar {
  id: string
  brand: string
  model: string
  year: number
  color: string
  type: string
  pricePerDay: number
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL'
  totalBookings: number
  totalEarnings: number
  image?: string
}

export default function DriverCarsPage() {
  const { user } = useAuth()
  
  // Mock data - replace with actual API calls
  const [cars] = useState<DriverCar[]>([
    {
      id: '1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      type: 'SEDAN',
      pricePerDay: 5000,
      status: 'ACTIVE',
      totalBookings: 23,
      totalEarnings: 115000,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80',
    },
    {
      id: '2',
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      color: 'Black',
      type: 'SEDAN',
      pricePerDay: 4500,
      status: 'ACTIVE',
      totalBookings: 18,
      totalEarnings: 81000,
      image: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&q=80',
    },
    {
      id: '3',
      brand: 'Toyota',
      model: 'Fortuner',
      year: 2023,
      color: 'White',
      type: 'SUV',
      pricePerDay: 8000,
      status: 'PENDING_APPROVAL',
      totalBookings: 0,
      totalEarnings: 0,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80',
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active'
      case 'INACTIVE':
        return 'Inactive'
      case 'PENDING_APPROVAL':
        return 'Pending Approval'
      default:
        return status
    }
  }

  const totalCars = cars.length
  const activeCars = cars.filter(car => car.status === 'ACTIVE').length
  const totalBookings = cars.reduce((sum, car) => sum + car.totalBookings, 0)
  const totalEarnings = cars.reduce((sum, car) => sum + car.totalEarnings, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                My Cars
              </h1>
              <p className="text-lg text-gray-300">
                Manage your fleet and track performance
              </p>
            </div>
            <Link href="/driver/cars/new">
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold px-6 py-3 rounded-xl">
                <span className="mr-2">➕</span>
                Add New Car
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300">Total Cars</p>
                    <p className="text-3xl font-bold text-white">{totalCars}</p>
                  </div>
                  <div className="text-4xl">🚗</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300">Active Cars</p>
                    <p className="text-3xl font-bold text-white">{activeCars}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300">Total Bookings</p>
                    <p className="text-3xl font-bold text-white">{totalBookings}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300">Total Earnings</p>
                    <p className="text-3xl font-bold text-white">
                      PKR {totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Cars List */}
        {cars.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                  {/* Car Image */}
                  <div className="relative h-48 bg-gray-200">
                    {car.image && (
                      <img
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
                      {getStatusText(car.status)}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {car.brand} {car.model}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{car.year} • {car.color} • {car.type}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          PKR {car.pricePerDay.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">Per Day</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{car.totalBookings}</p>
                        <p className="text-xs text-gray-600">Bookings</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {car.totalEarnings > 0 ? `${(car.totalEarnings / 1000).toFixed(0)}k` : '0'}
                        </p>
                        <p className="text-xs text-gray-600">Earned</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link href={`/driver/cars/${car.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          ✏️ Edit
                        </Button>
                      </Link>
                      <Link href={`/client/cars/${car.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          👁️ View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="px-4"
                        onClick={() => {
                          // Toggle car status
                        }}
                      >
                        {car.status === 'ACTIVE' ? '⏸️' : '▶️'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No cars listed yet
            </h3>
            <p className="text-gray-300 mb-8">
              Start earning by listing your first car
            </p>
            <Link href="/driver/cars/new">
              <Button className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold px-8 py-3 rounded-xl">
                <span className="mr-2">➕</span>
                Add Your First Car
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}