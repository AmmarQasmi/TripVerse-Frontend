'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Car } from '@/types'

interface CarDetailsProps {
  car: Car
}

export function CarDetails({ car }: CarDetailsProps) {
  const amenities = [
    { key: 'AC', label: 'Air Conditioning', icon: '❄️' },
    { key: 'GPS', label: 'GPS Navigation', icon: '🧭' },
    { key: 'BLUETOOTH', label: 'Bluetooth', icon: '📱' },
    { key: 'BACKUP_CAMERA', label: 'Backup Camera', icon: '📹' },
    { key: 'LEATHER_SEATS', label: 'Leather Seats', icon: '🪑' },
    { key: 'SUNROOF', label: 'Sunroof', icon: '☀️' },
    { key: 'HEATED_SEATS', label: 'Heated Seats', icon: '🔥' },
    { key: 'PARKING_SENSORS', label: 'Parking Sensors', icon: '🅿️' },
  ]

  const features = [
    { icon: '🚗', label: 'Type', value: car.type },
    { icon: '👥', label: 'Seats', value: `${car.seats} passengers` },
    { icon: '⚙️', label: 'Transmission', value: car.transmission },
    { icon: '⛽', label: 'Fuel Type', value: car.fuelType },
    { icon: '🎨', label: 'Color', value: car.color },
    { icon: '📅', label: 'Year', value: car.year.toString() },
  ]

  return (
    <div className="space-y-6">
      {/* Car Basic Info */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {car.brand} {car.model}
          </CardTitle>
          <p className="text-lg text-gray-600">{car.year} • {car.color}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-500">{feature.label}</p>
                  <p className="text-gray-900 font-semibold">{feature.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">📝</span>
            About This Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            This {car.brand} {car.model} is a {car.type.toLowerCase()} vehicle perfect for your travel needs. 
            With {car.seats} comfortable seats and {car.transmission.toLowerCase()} transmission, 
            it offers a smooth and enjoyable driving experience. The vehicle runs on {car.fuelType.toLowerCase()} 
            and is maintained in excellent condition by our verified driver.
          </p>
        </CardContent>
      </Card>

      {/* Features & Amenities */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">⭐</span>
            Features & Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amenities.map((amenity) => {
              const hasAmenity = car.features?.includes(amenity.key) || false
              return (
                <div key={amenity.key} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  hasAmenity ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-400'
                }`}>
                  <span className="text-xl">{amenity.icon}</span>
                  <span className="font-medium">{amenity.label}</span>
                  {hasAmenity && <span className="text-green-500 ml-auto">✓</span>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rental Policies */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">📋</span>
            Rental Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 mt-1">🚗</span>
              <div>
                <h4 className="font-semibold text-gray-900">Fuel Policy</h4>
                <p className="text-gray-600">Full-to-Full policy. Return the vehicle with the same fuel level as received.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 mt-1">📅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Cancellation Policy</h4>
                <p className="text-gray-600">Free cancellation up to 24 hours before pickup. 50% refund for cancellations within 24 hours.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 mt-1">🛡️</span>
              <div>
                <h4 className="font-semibold text-gray-900">Insurance</h4>
                <p className="text-gray-600">Basic insurance included. Optional comprehensive coverage available at checkout.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 mt-1">🧭</span>
              <div>
                <h4 className="font-semibold text-gray-900">Pickup/Drop-off</h4>
                <p className="text-gray-600">Flexible pickup and drop-off locations. Contact driver for specific arrangements.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">🧭</span>
            Location & Pickup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🧭</span>
              <div>
                <p className="font-semibold text-gray-900">Available in {car.location}</p>
                <p className="text-gray-600">Contact driver for exact pickup location</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <span className="font-semibold">Note:</span> Exact pickup location and time will be confirmed with the driver after booking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
