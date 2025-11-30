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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className="relative group"
    >
      {/* Card Container */}
      <div 
        className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group h-80"
        style={{
          border: '2px solid transparent',
          backgroundImage: `
            linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      >
        {/* Animated Neon Border - TripVerse Theme */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            opacity: 0.9,
            filter: 'blur(1px)',
            zIndex: -1,
            border: '2px solid transparent',
            backgroundClip: 'border-box'
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Outer Glow Effect */}
        <motion.div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            filter: 'blur(3px)',
            opacity: 0.4,
            zIndex: -2
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Corner Highlights */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>
        
        {/* Inner Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'} 
            alt={destination}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8">
          {/* Top: Status Badge */}
          <div className="flex justify-between items-start">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor()} backdrop-blur-sm`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            <div className="text-3xl">
              {type === 'hotel' ? '🏨' : '🚗'}
            </div>
          </div>

          {/* Bottom: Trip Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{destination}</h3>
            <p className="text-sm text-cyan-300 mb-4 flex items-center">
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

      </div>
    </motion.div>
  )
}

// New Trip Card Component
export function NewTripCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className="group"
    >
      <Link href="/client/hotels">
        <div 
          className="relative w-full max-w-[200px] mx-auto aspect-square rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group flex items-center justify-center"
          style={{
            border: '2px solid transparent',
            backgroundImage: `
              linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
              linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
            `,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          {/* Animated Neon Border - TripVerse Theme */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
              backgroundSize: '200% 100%',
              opacity: 0.9,
              filter: 'blur(1px)',
              zIndex: -1,
              border: '2px solid transparent',
              backgroundClip: 'border-box'
            }}
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Outer Glow Effect */}
          <motion.div 
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
              backgroundSize: '200% 100%',
              filter: 'blur(3px)',
              opacity: 0.4,
              zIndex: -2
            }}
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Corner Highlights */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>
          
          {/* Inner Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
          
          {/* Floating Plus Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center relative z-10"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm mb-0.5">Plan New Trip</p>
            <p className="text-cyan-300 text-xs px-2">Explore hotels & cars</p>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

