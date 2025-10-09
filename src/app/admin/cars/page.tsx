'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface CarListing {
  id: string
  brand: string
  model: string
  year: number
  type: string
  pricePerDay: number
  driverName: string
  driverId: string
  submittedDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  images: string[]
  location: string
}

export default function AdminCarsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  // Mock data
  const cars: CarListing[] = [
    {
      id: '1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2022,
      type: 'SEDAN',
      pricePerDay: 5000,
      driverName: 'Ahmed Khan',
      driverId: '1',
      submittedDate: '2024-01-15',
      status: 'PENDING',
      images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80'],
      location: 'Lahore',
    },
    {
      id: '2',
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      type: 'SEDAN',
      pricePerDay: 4500,
      driverName: 'Sara Ahmed',
      driverId: '2',
      submittedDate: '2024-01-12',
      status: 'APPROVED',
      images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&q=80'],
      location: 'Karachi',
    },
    {
      id: '3',
      brand: 'Toyota',
      model: 'Fortuner',
      year: 2023,
      type: 'SUV',
      pricePerDay: 8000,
      driverName: 'Ahmed Khan',
      driverId: '1',
      submittedDate: '2024-01-14',
      status: 'PENDING',
      images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80'],
      location: 'Lahore',
    },
  ]

  const filteredCars = cars.filter(car => {
    if (filter === 'all') return true
    if (filter === 'pending') return car.status === 'PENDING'
    if (filter === 'approved') return car.status === 'APPROVED'
    if (filter === 'rejected') return car.status === 'REJECTED'
    return true
  })

  const stats = {
    total: cars.length,
    pending: cars.filter(c => c.status === 'PENDING').length,
    approved: cars.filter(c => c.status === 'APPROVED').length,
    rejected: cars.filter(c => c.status === 'REJECTED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = async (carId: string) => {
    console.log('Approving car:', carId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleReject = async (carId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      console.log('Rejecting car:', carId, 'Reason:', reason)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Car Listings Management
            </h1>
            <p className="text-lg text-gray-300">
              Review and approve car listings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'all' 
                    ? 'bg-blue-500/20 border-2 border-blue-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('all')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Total Cars</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
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
              <Card 
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'pending' 
                    ? 'bg-yellow-500/20 border-2 border-yellow-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('pending')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Pending Review</p>
                      <p className="text-3xl font-bold text-white">{stats.pending}</p>
                    </div>
                    <div className="text-4xl">⏳</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'approved' 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('approved')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Approved</p>
                      <p className="text-3xl font-bold text-white">{stats.approved}</p>
                    </div>
                    <div className="text-4xl">✅</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card 
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'rejected' 
                    ? 'bg-red-500/20 border-2 border-red-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('rejected')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Rejected</p>
                      <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                    </div>
                    <div className="text-4xl">❌</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Cars List */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {filter === 'all' && 'All Car Listings'}
                  {filter === 'pending' && 'Pending Approvals'}
                  {filter === 'approved' && 'Approved Listings'}
                  {filter === 'rejected' && 'Rejected Listings'}
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {filteredCars.length} listing{filteredCars.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                      {/* Car Image */}
                      <div className="relative h-48 bg-gray-200">
                        {car.images[0] && (
                          <img
                            src={car.images[0]}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
                          {car.status}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {car.year} • {car.type}
                        </p>

                        <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                          <span>📍 {car.location}</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Price per day</p>
                            <p className="text-lg font-bold text-gray-900">
                              PKR {car.pricePerDay.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-3 mb-3">
                          <p className="text-sm text-gray-600">Driver</p>
                          <Link href={`/admin/drivers/${car.driverId}`}>
                            <p className="font-medium text-blue-600 hover:text-blue-700">
                              {car.driverName}
                            </p>
                          </Link>
                          <p className="text-xs text-gray-500">
                            Submitted {new Date(car.submittedDate).toLocaleDateString()}
                          </p>
                        </div>

                        {car.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApprove(car.id)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2"
                            >
                              ✅ Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(car.id)}
                              variant="outline"
                              className="flex-1 border-red-500 text-red-600 hover:bg-red-50 text-sm py-2"
                            >
                              ❌ Reject
                            </Button>
                          </div>
                        )}

                        {car.status === 'APPROVED' && (
                          <Link href={`/client/cars/${car.id}`}>
                            <Button variant="outline" className="w-full text-sm py-2">
                              👁️ View Listing
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredCars.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No cars found
                    </h3>
                    <p className="text-gray-600">
                      No cars match the selected filter
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
