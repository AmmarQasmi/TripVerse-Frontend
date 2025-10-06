'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CarCard } from '@/components/cars/CarCard'
import { useCarSearch } from '@/features/cars/useCarSearch'

export default function CarsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState('')
  const [seats, setSeats] = useState('')
  
  const { data: cars, isLoading } = useCarSearch({
    query: searchQuery,
    location,
    startDate,
    endDate,
    type,
    seats: seats ? parseInt(seats) : undefined,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Perfect Car
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Input
              label="Search cars"
              placeholder="Brand, model, or description"
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
              label="Pick-up Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Return Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any type</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="CONVERTIBLE">Convertible</option>
                <option value="VAN">Van</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <Input
              label="Seats"
              type="number"
              placeholder="Min seats"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            />
          </div>
          
          <div className="mt-4">
            <Button className="w-full md:w-auto">
              Search Cars
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Results */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {cars?.length || 0} cars found
        </div>
        {location && (
          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            📍 {location}
          </div>
        )}
        {startDate && endDate && (
          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            📅 {startDate} - {endDate}
          </div>
        )}
        {type && (
          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            🚗 {type}
          </div>
        )}
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
        ) : cars && cars.length > 0 ? (
          cars.map((car) => (
            <Link key={car.id} href={`/(client)/cars/${car.id}`}>
              <CarCard car={car} />
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              🚗 No cars found matching your criteria
            </div>
            <p className="text-gray-400">
              Try adjusting your search filters or check back later for new listings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
