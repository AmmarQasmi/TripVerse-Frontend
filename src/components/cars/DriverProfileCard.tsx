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
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg sticky top-8">
      <CardHeader className="text-center">
        {/* Driver Avatar */}
        <div className="mx-auto mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {driver.full_name?.charAt(0) || 'D'}
          </div>
        </div>

        {/* Driver Name & Verification */}
        <div className="space-y-2">
          <CardTitle className="text-xl font-bold text-white">
            {driver.full_name || 'Driver'}
          </CardTitle>
          
          {driver.isVerified && (
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
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
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-2xl font-bold text-white ml-1">
                {driver.rating?.toFixed(1) || 'New'}
              </span>
            </div>
            <span className="text-gray-400">
              ({driver.totalTrips || 0} trips)
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
              <p className="text-2xl font-bold text-white">{driver.totalTrips || 0}</p>
              <p className="text-sm text-gray-400">Total Trips</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
              <p className="text-2xl font-bold text-white">{carCount}</p>
              <p className="text-sm text-gray-400">Cars Listed</p>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-300">{formatJoinDate(driver.joinedDate)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-gray-300">{getResponseTimeText(driver.responseTime)}</span>
          </div>
          
          {driver.languages && driver.languages.length > 0 && (
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <div>
                <p className="text-gray-300">Speaks {driver.languages.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-3 rounded-xl transition-all duration-75">
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact Driver
          </Button>
          
          <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-4-1a1 1 0 001 1h1M5 17a2 2 0 104 0M5 17a2 2 0 114 0m6 0a2 2 0 104 0m6 0a2 2 0 114 0" />
            </svg>
            View More Cars
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-white/20 pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Verified Identity</span>
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Background Check</span>
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">License Verified</span>
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Insurance Coverage</span>
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg">
          <p className="text-blue-200 text-sm">
            <span className="font-semibold">Safety First:</span> All drivers are verified and insured. 
            Your safety is our top priority.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
