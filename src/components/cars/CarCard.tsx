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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`relative h-full ${!isAvailable ? 'opacity-75' : ''}`}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-75 cursor-pointer border border-white/10 shadow-lg bg-gray-800/50 backdrop-blur-sm h-full flex flex-col">
        {/* Image Section */}
        <div className="aspect-video bg-gray-700 relative overflow-hidden">
          {car.images?.[0] ? (
            <Image
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-75"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          )}
          
          {/* Availability Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
            isAvailable 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {isAvailable ? 'Available' : 'Booked'}
          </div>

          {/* Verification Badge */}
          {car.driver?.isVerified && (
            <div className="absolute top-3 right-3 bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-semibold">
            PKR {car.pricePerDay?.toLocaleString()}/day
          </div>

          {/* Unavailable Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Unavailable</span>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white">
            {car.brand} {car.model}
          </CardTitle>
          <p className="text-sm text-gray-400">{car.year} {car.color ? `• ${car.color}` : ''}</p>
        </CardHeader>
        
        <CardContent className="py-2 flex-1">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-300">{car.seats} seats</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-300 capitalize">{car.transmission}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-300 capitalize">{car.fuelType}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-300 truncate">{car.location}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-2.5 rounded-xl transition-all duration-75 shadow-lg hover:shadow-xl"
            disabled={!isAvailable}
          >
            {isAvailable ? 'View Details' : 'Unavailable'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
