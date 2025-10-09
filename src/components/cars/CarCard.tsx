import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Car, User } from '@/types'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface CarCardProps {
  car: Car & {
    driver?: User & {
      isVerified?: boolean
      rating?: number
      totalTrips?: number
    }
  }
  isAvailable?: boolean
}

export function CarCard({ car, isAvailable = true }: CarCardProps) {
  const availabilityStatus = isAvailable ? 'available' : 'booked'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`relative ${!isAvailable ? 'opacity-75' : ''}`}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white">
        {/* Image Section */}
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {car.images?.[0] && (
            <Image
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )}
          
          {/* Availability Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
            isAvailable 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {isAvailable ? 'Available' : 'Booked'}
          </div>

          {/* Verification Badge */}
          {car.driver?.isVerified && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <span className="mr-1">✅</span>
              Verified Driver
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold">
            PKR {car.pricePerDay?.toLocaleString()}/day
          </div>

          {/* Unavailable Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Unavailable</span>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900">
            {car.brand} {car.model}
          </CardTitle>
          <p className="text-sm text-gray-600">{car.year} • {car.color}</p>
          
          {/* Driver Info */}
          {car.driver && (
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {car.driver.name?.charAt(0) || 'D'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {car.driver.name || 'Driver'}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-xs text-gray-600 ml-1">
                      {car.driver.rating?.toFixed(1) || 'New'}
                    </span>
                  </div>
                  {car.driver.totalTrips && (
                    <span className="text-xs text-gray-500">
                      • {car.driver.totalTrips} trips
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="py-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">🚗</span>
              <span className="text-gray-700">{car.type}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">👥</span>
              <span className="text-gray-700">{car.seats} seats</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">⚙️</span>
              <span className="text-gray-700">{car.transmission}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">⛽</span>
              <span className="text-gray-700">{car.fuelType}</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <span className="text-gray-500 mr-1">📍</span>
              <span>{car.location}</span>
            </div>
            {car.rating && (
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">⭐</span>
                <span className="text-gray-600">{car.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-3">
          <Button 
            className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            disabled={!isAvailable}
          >
            {isAvailable ? 'View Details' : 'Unavailable'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
