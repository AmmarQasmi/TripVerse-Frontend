'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type SearchType = 'flight' | 'hotel' | 'rental'

export function SearchBar() {
  const [searchType, setSearchType] = useState<SearchType>('flight')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Searching for:', searchType)
  }

  return (
    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-4 z-20">
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b">
          {[
            { key: 'flight', label: '✈️ Flight', icon: '✈️' },
            { key: 'hotel', label: '🏨 Hotel', icon: '🏨' },
            { key: 'rental', label: '🚗 Rental', icon: '🚗' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchType(tab.key as SearchType)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                searchType === tab.key
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {searchType === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
          ))}
        </div>

        {/* Search Forms */}
        <form onSubmit={handleSearch}>
          {searchType === 'flight' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input label="From" placeholder="Departure city" />
              <Input label="To" placeholder="Destination city" />
              <Input label="Departure" type="date" />
              <Input label="Return" type="date" />
              <Input label="Travelers" type="number" min="1" defaultValue="1" />
            </div>
          )}

          {searchType === 'hotel' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Destination" placeholder="City or hotel name" />
              <Input label="Check-in" type="date" />
              <Input label="Check-out" type="date" />
              <Input label="Guests" type="number" min="1" defaultValue="2" />
            </div>
          )}

          {searchType === 'rental' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input label="Pickup Location" placeholder="City or address" />
              <Input label="Pickup Date" type="date" />
              <Input label="Return Date" type="date" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Any</option>
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>Van</option>
                  <option>Luxury</option>
                </select>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button 
              type="submit" 
              className="bg-accent hover:bg-accent/90 text-white px-12 py-3 text-lg rounded-full"
            >
              Search Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

