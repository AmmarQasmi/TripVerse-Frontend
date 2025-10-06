'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useDriversAdmin } from '@/features/admin/useDriversAdmin'

export default function AdminDriversPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('all')
  
  const { data: drivers, isLoading, verifyDriver, rejectDriver } = useDriversAdmin()

  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || driver.verificationStatus === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleVerifyDriver = async (driverId: string) => {
    try {
      await verifyDriver(driverId)
    } catch (error) {
      console.error('Failed to verify driver:', error)
    }
  }

  const handleRejectDriver = async (driverId: string) => {
    if (confirm('Are you sure you want to reject this driver verification?')) {
      try {
        await rejectDriver(driverId)
      } catch (error) {
        console.error('Failed to reject driver:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Driver Management
        </h1>
        <p className="text-lg text-gray-600">
          Review and verify driver applications for the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            label="Search Drivers"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{drivers?.length || 0}</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {drivers?.filter(d => d.verificationStatus === 'PENDING').length || 0}
                </p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Verified Drivers</p>
                <p className="text-2xl font-bold text-green-600">
                  {drivers?.filter(d => d.verificationStatus === 'VERIFIED').length || 0}
                </p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drivers List */}
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
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver) => (
            <Card key={driver.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{driver.name}</h3>
                        <p className="text-sm text-gray-600">{driver.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.verificationStatus || 'PENDING')}`}>
                        {driver.verificationStatus || 'PENDING'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Phone:</span> {driver.phone || 'Not provided'}
                      </div>
                      <div>
                        <span className="font-medium">Joined:</span> {formatDate(driver.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">License:</span> {driver.driverLicense ? 'Provided' : 'Missing'}
                      </div>
                    </div>

                    {driver.driverLicense && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Driver License:</span>
                        <p className="text-sm text-gray-600">{driver.driverLicense}</p>
                      </div>
                    )}

                    {driver.carDocuments && driver.carDocuments.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Car Documents:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {driver.carDocuments.map((doc, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Document {index + 1}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    {driver.verificationStatus === 'PENDING' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleVerifyDriver(driver.id)}
                        >
                          Verify Driver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRejectDriver(driver.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Reject
                        </Button>
                      </>
                    )}
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
                👥 No drivers found
              </div>
              <p className="text-gray-400">
                {searchQuery || statusFilter !== 'all' 
                  ? "No drivers match your search criteria."
                  : "No drivers have registered yet."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
