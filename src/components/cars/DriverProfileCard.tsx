'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User } from '@/types'

interface DriverProfileCardProps {
  driver: User & {
    isVerified?: boolean
    rating?: number
    totalTrips?: number
    joinedDate?: string
    responseTime?: string
    languages?: string[]
  }
  carCount?: number
}

export function DriverProfileCard({ driver, carCount = 1 }: DriverProfileCardProps) {
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined'
    const date = new Date(dateString)
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  }

  const getResponseTimeText = (time?: string) => {
    if (!time) return 'Usually responds within an hour'
    return `Usually responds ${time}`
  }

  return (
    <Card className="shadow-lg sticky top-8">
      <CardHeader className="text-center">
        {/* Driver Avatar */}
        <div className="mx-auto mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {driver.full_name?.charAt(0) || 'D'}
          </div>
        </div>

        {/* Driver Name & Verification */}
        <div className="space-y-2">
          <CardTitle className="text-xl font-bold text-gray-900">
            {driver.full_name || 'Driver'}
          </CardTitle>
          
          {driver.isVerified && (
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1">✅</span>
                Verified Driver
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating & Stats */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <span className="text-yellow-400 text-2xl">⭐</span>
              <span className="text-2xl font-bold text-gray-900 ml-1">
                {driver.rating?.toFixed(1) || 'New'}
              </span>
            </div>
            <span className="text-gray-500">
              ({driver.totalTrips || 0} trips)
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{driver.totalTrips || 0}</p>
              <p className="text-sm text-gray-600">Total Trips</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{carCount}</p>
              <p className="text-sm text-gray-600">Cars Listed</p>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-gray-500">📅</span>
            <span className="text-gray-700">{formatJoinDate(driver.joinedDate)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-gray-500">⚡</span>
            <span className="text-gray-700">{getResponseTimeText(driver.responseTime)}</span>
          </div>
          
          {driver.languages && driver.languages.length > 0 && (
            <div className="flex items-start space-x-3">
              <span className="text-gray-500 mt-1">🗣️</span>
              <div>
                <p className="text-gray-700">Speaks {driver.languages.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-3 rounded-xl transition-all duration-300">
            <span className="mr-2">💬</span>
            Contact Driver
          </Button>
          
          <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
            <span className="mr-2">🚗</span>
            View More Cars
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="border-t pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verified Identity</span>
              <span className="text-green-500">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Background Check</span>
              <span className="text-green-500">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">License Verified</span>
              <span className="text-green-500">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Insurance Coverage</span>
              <span className="text-green-500">✓</span>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 text-sm">
            <span className="font-semibold">Safety First:</span> All drivers are verified and insured. 
            Your safety is our top priority.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
