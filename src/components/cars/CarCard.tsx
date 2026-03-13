import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Car, User } from '@/types'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface CarCardProps {
  car: Car & {
    driver?: {
      id: number
      full_name: string
      city?: User['city'] | string
      isVerified?: boolean
      rating?: number
      totalTrips?: number
      avg_in_app_rating?: number | null
      total_in_app_reviews?: number
    }
    // Dual-mode availability
    availableForRental?: boolean
    availableForRideHailing?: boolean
    // Ride-hailing pricing
    baseFare?: number
    perKmRate?: number
    perMinuteRate?: number
    minimumFare?: number
    // Distance rate for rentals
    distanceRatePerKm?: number
  }
  isAvailable?: boolean
}

export function CarCard({ car, isAvailable = true }: CarCardProps) {
  // Determine availability modes
  const availableForRental = car.availableForRental ?? true
  const availableForRideHailing = car.availableForRideHailing ?? false
  const supportsBothModes = availableForRental && availableForRideHailing

  // Get availability badge text and color
  const getAvailabilityBadge = () => {
    if (supportsBothModes) {
      return { text: 'Rentals & Rides', color: 'bg-purple-500/90' }
    } else if (availableForRideHailing) {
      return { text: 'Rides Only', color: 'bg-teal-500/90' }
    } else {
      return { text: 'Rentals Only', color: 'bg-blue-500/90' }
    }
  }

  const availabilityBadge = getAvailabilityBadge()
  const driverName = car.driver?.full_name || 'Driver'
  const driverInitial = driverName.charAt(0).toUpperCase()
  const driverRating = car.driver?.rating ?? car.rating
  const inAppRating = car.driver?.avg_in_app_rating
  const totalInAppReviews = car.driver?.total_in_app_reviews
  const totalTrips = car.driver?.totalTrips
  const numericDayRate = Number(car.pricePerDay ?? 0)
  const numericBaseFare = Number(car.baseFare ?? 0)
  const numericPerKmRate = Number(car.perKmRate ?? 0)
  const hasValidDayRate = Number.isFinite(numericDayRate) && numericDayRate >= 1

  const priceBadge = (() => {
    if (availableForRideHailing && (!availableForRental || !hasValidDayRate)) {
      if (numericBaseFare > 0) {
        return `PKR ${numericBaseFare.toLocaleString()} base fare`
      }
      if (numericPerKmRate > 0) {
        return `PKR ${numericPerKmRate.toLocaleString()}/km`
      }
      return 'Price on request'
    }

    if (hasValidDayRate) {
      return `PKR ${numericDayRate.toLocaleString()}/day`
    }

    if (numericBaseFare > 0) {
      return `PKR ${numericBaseFare.toLocaleString()} base fare`
    }

    return 'Price on request'
  })()

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

          {/* Mode Availability Badge */}
          <div className={`absolute top-10 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium ${availabilityBadge.color} text-white`}>
            {availabilityBadge.text}
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

          {/* Driver Meta */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs max-w-[75%]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] flex items-center justify-center text-[10px] font-bold">
                {driverInitial}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{driverName}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                  {driverRating && driverRating > 0 && (
                    <span className="flex items-center gap-1" title="Platform rating (Uber/Careem)">
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-gray-400">{Number(driverRating).toFixed(1)}</span>
                    </span>
                  )}
                  {inAppRating != null && inAppRating > 0 ? (
                    <span className="flex items-center gap-1" title="TripVerse passenger rating">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {Number(inAppRating).toFixed(1)}
                      {totalInAppReviews ? ` (${totalInAppReviews})` : ''}
                    </span>
                  ) : (
                    !driverRating && <span className="text-gray-500">New</span>
                  )}
                  <span>{totalTrips && totalTrips > 0 ? `${totalTrips} trips` : 'Verified profile'}</span>
                </div>
              </div>
            </div>
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
          <p className="text-sm text-teal-300 font-semibold">{priceBadge}</p>
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
