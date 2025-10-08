'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface TripCardProps {
  id: string
  destination: string
  imageUrl: string
  startDate: string
  endDate: string
  type: 'hotel' | 'car'
  status: 'upcoming' | 'active' | 'completed'
  onCancel?: () => void
}

export function TripCard({
  id,
  destination,
  imageUrl,
  startDate,
  endDate,
  type,
  status,
  onCancel
}: TripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'upcoming': return 'bg-blue-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gray-900 border border-white/10 h-80">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'} 
            alt={destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6">
          {/* Top: Status Badge */}
          <div className="flex justify-between items-start">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor()} backdrop-blur-sm`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            <div className="text-2xl">
              {type === 'hotel' ? '🏨' : '🚗'}
            </div>
          </div>

          {/* Bottom: Trip Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{destination}</h3>
            <p className="text-sm text-green-200/80 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(startDate)} - {formatDate(endDate)}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/client/bookings/${id}`} className="flex-1">
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
                  size="sm"
                >
                  View Details
                </Button>
              </Link>
              
              {status !== 'completed' && onCancel && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 backdrop-blur-sm"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent" />
        </div>
      </div>
    </motion.div>
  )
}

// New Trip Card Component
export function NewTripCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="group"
    >
      <Link href="/client/hotels">
        <div className="relative overflow-hidden rounded-2xl h-80 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-300 flex items-center justify-center bg-white shadow-sm group-hover:shadow-lg">
          {/* Floating Plus Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-1">Plan New Trip</p>
            <p className="text-gray-600 text-sm">Explore hotels & cars</p>
          </motion.div>

          {/* Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

