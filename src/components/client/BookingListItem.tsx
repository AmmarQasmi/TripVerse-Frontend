'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface BookingListItemProps {
  id: string
  type: 'hotel' | 'car'
  name: string
  date: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  amount: number
  delay?: number
}

export function BookingListItem({
  id,
  type,
  name,
  date,
  status,
  amount,
  delay = 0
}: BookingListItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = () => {
    return type === 'hotel' ? '🏨' : '🚗'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ x: 4 }}
      className="group"
    >
      <Link href={`/client/bookings/${id}`}>
        <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-300">
          {/* Hover Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            {/* Left: Icon + Info */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Type Icon */}
              <div className="text-3xl">{getTypeIcon()}</div>
              
              {/* Booking Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 font-semibold text-sm mb-1 truncate">
                  {name}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    ${amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()} whitespace-nowrap ml-4`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

