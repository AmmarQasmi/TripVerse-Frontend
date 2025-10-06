'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useCarById } from '@/features/cars/useCarSearch'

export default function CarDetailPage() {
  const params = useParams()
  const carId = params.id as string
  
  const { data: car, isLoading, error } = useCarById(carId)
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
  })

  const handleBooking = () => {
    // TODO: Implement car booking
    console.log('Booking car:', carId, bookingData)
  }

  const calculateTotalPrice = () => {
    if (!car || !bookingData.startDate || !bookingData.endDate) return 0
    
    const start = new Date(bookingData.startDate)
    const end = new Date(bookingData.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    return car.pricePerDay * days
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Car not found
          </h1>
          <p className="text-gray-600">
            The car you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {car.brand} {car.model}
        </h1>
        <p className="text-lg text-gray-600">{car.year} • {car.color}</p>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-sm text-gray-500">⭐ {car.rating || 'N/A'}</span>
          <span className="text-sm text-gray-500">
            ${car.pricePerDay}/day
          </span>
          <span className="text-sm text-gray-500">📍 {car.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Car Images */}
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            {car.images?.[0] ? (
              <img
                src={car.images[0]}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          {/* Car Details */}
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Type</span>
                  <p className="text-lg">{car.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Seats</span>
                  <p className="text-lg">{car.seats}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Transmission</span>
                  <p className="text-lg">{car.transmission}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Fuel Type</span>
                  <p className="text-lg">{car.fuelType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Year</span>
                  <p className="text-lg">{car.year}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Color</span>
                  <p className="text-lg">{car.color}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {car.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Driver Info */}
          {car.driver && (
            <Card>
              <CardHeader>
                <CardTitle>About the Driver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {car.driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{car.driver.name}</h3>
                    <p className="text-sm text-gray-600">{car.driver.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Driver
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Rent this car</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Pick-up Date"
                type="date"
                value={bookingData.startDate}
                onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
              />
              
              <Input
                label="Return Date"
                type="date"
                value={bookingData.endDate}
                onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
              />

              <div className="pt-4 border-t">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Daily rate:</span>
                    <span>${car.pricePerDay}</span>
                  </div>
                  {bookingData.startDate && bookingData.endDate && (
                    <>
                      <div className="flex justify-between">
                        <span>Days:</span>
                        <span>
                          {Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service fee:</span>
                        <span>${Math.round(calculateTotalPrice() * 0.1)}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${calculateTotalPrice() + Math.round(calculateTotalPrice() * 0.1)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleBooking}
                  disabled={!bookingData.startDate || !bookingData.endDate}
                >
                  Rent Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
