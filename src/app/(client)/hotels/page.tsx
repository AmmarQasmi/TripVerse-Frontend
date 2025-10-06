'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HotelCard } from '@/components/hotels/HotelCard'
import { useHotelSearch } from '@/features/hotels/useHotelSearch'

export default function HotelsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  
  const { data: hotels, isLoading } = useHotelSearch({
    query: searchQuery,
    location,
    checkIn,
    checkOut,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Perfect Hotel
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search hotels"
              placeholder="Hotel name or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Input
              label="Location"
              placeholder="City, country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Check-in"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <Input
              label="Check-out"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          
          <div className="mt-4">
            <Button className="w-full md:w-auto">
              Search Hotels
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : (
          hotels?.map((hotel) => (
            <Link key={hotel.id} href={`/(client)/hotels/${hotel.id}`}>
              <HotelCard hotel={hotel} />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
