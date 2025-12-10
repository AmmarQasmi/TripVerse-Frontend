'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Car } from '@/types'

interface CarDetailsProps {
  car: Car
}

export function CarDetails({ car }: CarDetailsProps) {
  const amenities = [
    { key: 'AC', label: 'Air Conditioning' },
    { key: 'GPS', label: 'GPS Navigation' },
    { key: 'BLUETOOTH', label: 'Bluetooth' },
    { key: 'BACKUP_CAMERA', label: 'Backup Camera' },
    { key: 'LEATHER_SEATS', label: 'Leather Seats' },
    { key: 'SUNROOF', label: 'Sunroof' },
    { key: 'HEATED_SEATS', label: 'Heated Seats' },
    { key: 'PARKING_SENSORS', label: 'Parking Sensors' },
  ]

  const features = [
    { label: 'Type', value: car.type },
    { label: 'Seats', value: `${car.seats} passengers` },
    { label: 'Transmission', value: car.transmission },
    { label: 'Fuel Type', value: car.fuelType },
    { label: 'Color', value: car.color },
    { label: 'Year', value: car.year.toString() },
  ]

  return (
    <div className="space-y-6">
      {/* Car Basic Info */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            {car.brand} {car.model}
          </CardTitle>
          <p className="text-lg text-gray-300">{car.year} • {car.color}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400">{feature.label}</p>
                  <p className="text-white font-semibold">{feature.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            About This Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">
            This {car.brand} {car.model} is a {car.type.toLowerCase()} vehicle perfect for your travel needs. 
            With {car.seats} comfortable seats and {car.transmission.toLowerCase()} transmission, 
            it offers a smooth and enjoyable driving experience. The vehicle runs on {car.fuelType.toLowerCase()} 
            and is maintained in excellent condition by our verified driver.
          </p>
        </CardContent>
      </Card>

      {/* Features & Amenities */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            Features & Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amenities.map((amenity) => {
              const hasAmenity = car.features?.includes(amenity.key) || false
              return (
                <div key={amenity.key} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors border ${
                  hasAmenity ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-white/5 text-gray-400 border-white/10'
                }`}>
                  <span className="font-medium">{amenity.label}</span>
                  {hasAmenity && (
                    <svg className="w-5 h-5 text-green-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rental Policies */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            Rental Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-white">Fuel Policy</h4>
                <p className="text-gray-300">Full-to-Full policy. Return the vehicle with the same fuel level as received.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h4 className="font-semibold text-white">Cancellation Policy</h4>
                <p className="text-gray-300">Free cancellation up to 24 hours before pickup. 50% refund for cancellations within 24 hours.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h4 className="font-semibold text-white">Insurance</h4>
                <p className="text-gray-300">Basic insurance included. Optional comprehensive coverage available at checkout.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-white">Pickup/Drop-off</h4>
                <p className="text-gray-300">Flexible pickup and drop-off locations. Contact driver for specific arrangements.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            Location & Pickup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-semibold text-white">Available in {car.location}</p>
                <p className="text-gray-300">Contact driver for exact pickup location</p>
              </div>
            </div>
            
            <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg">
              <p className="text-blue-200 text-sm">
                <span className="font-semibold">Note:</span> Exact pickup location and time will be confirmed with the driver after booking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
