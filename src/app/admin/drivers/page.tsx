'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  joinedDate: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'INCOMPLETE'
  totalCars: number
  totalTrips: number
  totalEarnings: number
  rating: number
  documentsSubmitted: number
  documentsTotal: number
}

export default function AdminDriversPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  
  // Mock data
  const drivers: Driver[] = [
    {
      id: '1',
      name: 'Ahmed Khan',
      email: 'ahmed.khan@example.com',
      phone: '+92 300 1234567',
      joinedDate: '2024-01-10',
      verificationStatus: 'PENDING',
      totalCars: 2,
      totalTrips: 0,
      totalEarnings: 0,
      rating: 0,
      documentsSubmitted: 3,
      documentsTotal: 4,
    },
    {
      id: '2',
      name: 'Sara Ahmed',
      email: 'sara.ahmed@example.com',
      phone: '+92 301 9876543',
      joinedDate: '2023-12-15',
      verificationStatus: 'VERIFIED',
      totalCars: 3,
      totalTrips: 45,
      totalEarnings: 225000,
      rating: 4.8,
      documentsSubmitted: 4,
      documentsTotal: 4,
    },
    {
      id: '3',
      name: 'Ali Hassan',
      email: 'ali.hassan@example.com',
      phone: '+92 333 4567890',
      joinedDate: '2024-01-08',
      verificationStatus: 'INCOMPLETE',
      totalCars: 0,
      totalTrips: 0,
      totalEarnings: 0,
      rating: 0,
      documentsSubmitted: 1,
      documentsTotal: 4,
    },
    {
      id: '4',
      name: 'Fatima Malik',
      email: 'fatima.malik@example.com',
      phone: '+92 345 2345678',
      joinedDate: '2023-11-20',
      verificationStatus: 'VERIFIED',
      totalCars: 1,
      totalTrips: 23,
      totalEarnings: 115000,
      rating: 4.9,
      documentsSubmitted: 4,
      documentsTotal: 4,
    },
    {
      id: '5',
      name: 'Usman Shah',
      email: 'usman.shah@example.com',
      phone: '+92 321 3456789',
      joinedDate: '2024-01-12',
      verificationStatus: 'REJECTED',
      totalCars: 0,
      totalTrips: 0,
      totalEarnings: 0,
      rating: 0,
      documentsSubmitted: 4,
      documentsTotal: 4,
    },
  ]

  const filteredDrivers = drivers.filter(driver => {
    if (filter === 'all') return true
    if (filter === 'pending') return driver.verificationStatus === 'PENDING' || driver.verificationStatus === 'INCOMPLETE'
    if (filter === 'verified') return driver.verificationStatus === 'VERIFIED'
    if (filter === 'rejected') return driver.verificationStatus === 'REJECTED'
    return true
  })

  const stats = {
    total: drivers.length,
    pending: drivers.filter(d => d.verificationStatus === 'PENDING' || d.verificationStatus === 'INCOMPLETE').length,
    verified: drivers.filter(d => d.verificationStatus === 'VERIFIED').length,
    rejected: drivers.filter(d => d.verificationStatus === 'REJECTED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'INCOMPLETE':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return '✅'
      case 'PENDING':
        return '⏳'
      case 'REJECTED':
        return '❌'
      case 'INCOMPLETE':
        return '📄'
      default:
        return '📄'
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
              Driver Management
            </h1>
            <p className="text-lg text-gray-300">
              Review and manage driver verifications
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
                      <p className="text-sm font-medium text-gray-300">Total Drivers</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="text-4xl">👥</div>
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
                  filter === 'verified' 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('verified')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Verified</p>
                      <p className="text-3xl font-bold text-white">{stats.verified}</p>
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

          {/* Drivers List */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {filter === 'all' && 'All Drivers'}
                  {filter === 'pending' && 'Pending Verifications'}
                  {filter === 'verified' && 'Verified Drivers'}
                  {filter === 'rejected' && 'Rejected Applications'}
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDrivers.map((driver, index) => (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📧 {driver.email}</p>
                              <p>📱 {driver.phone}</p>
                              <p>📅 Joined {new Date(driver.joinedDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.verificationStatus)}`}>
                            {getStatusIcon(driver.verificationStatus)} {driver.verificationStatus}
                          </span>
                          <span className="text-xs text-gray-600">
                            Documents: {driver.documentsSubmitted}/{driver.documentsTotal}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Cars</p>
                          <p className="text-lg font-bold text-gray-900">{driver.totalCars}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Trips</p>
                          <p className="text-lg font-bold text-gray-900">{driver.totalTrips}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Earnings</p>
                          <p className="text-lg font-bold text-gray-900">
                            {driver.totalEarnings > 0 ? `${(driver.totalEarnings / 1000).toFixed(0)}k` : '0'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-lg font-bold text-gray-900">
                            {driver.rating > 0 ? `⭐ ${driver.rating}` : 'New'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link href={`/admin/drivers/${driver.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white">
                            {driver.verificationStatus === 'PENDING' || driver.verificationStatus === 'INCOMPLETE' 
                              ? '📄 Review Documents'
                              : '👁️ View Profile'
                            }
                          </Button>
                        </Link>
                        <Button variant="outline" className="px-6">
                          💬 Contact
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredDrivers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No drivers found
                    </h3>
                    <p className="text-gray-600">
                      No drivers match the selected filter
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