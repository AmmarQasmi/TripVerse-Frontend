'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useHotelById } from '@/features/hotels/useHotelSearch'

export default function HotelDetailPage() {
  const params = useParams()
  const hotelId = params.id as string
  
  const { data: hotel, isLoading, error } = useHotelById(hotelId)
  
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomTypeId: '',
  })

  const handleBooking = () => {
    // TODO: Implement hotel booking
    console.log('Booking hotel:', hotelId, bookingData)
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

  if (error || !hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Hotel not found
          </h1>
          <p className="text-gray-600">
            The hotel you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
        <p className="text-lg text-gray-600">{hotel.location}</p>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-sm text-gray-500">⭐ {hotel.rating || 'N/A'}</span>
          <span className="text-sm text-gray-500">
            ${hotel.pricePerNight || 'N/A'}/night
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Hotel Images */}
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            {hotel.images?.[0] ? (
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this hotel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{hotel.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {hotel.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Room Types */}
          {hotel.roomTypes && hotel.roomTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hotel.roomTypes.map((room) => (
                    <div
                      key={room.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setBookingData(prev => ({ ...prev, roomTypeId: room.id }))}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{room.name}</h3>
                          <p className="text-sm text-gray-600">{room.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Capacity: {room.capacity} guests
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${room.pricePerNight}/night</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Book this hotel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Check-in Date"
                type="date"
                value={bookingData.checkIn}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
              />
              
              <Input
                label="Check-out Date"
                type="date"
                value={bookingData.checkOut}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
              />
              
              <Input
                label="Number of Guests"
                type="number"
                min="1"
                value={bookingData.guests}
                onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
              />

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total Price:</span>
                  <span className="text-lg font-bold">
                    ${hotel.pricePerNight || 0} × {bookingData.checkIn && bookingData.checkOut 
                      ? Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                      : 1} nights
                  </span>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleBooking}
                  disabled={!bookingData.checkIn || !bookingData.checkOut || !bookingData.roomTypeId}
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
