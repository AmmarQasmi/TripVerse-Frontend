'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, CarFront, Plane, CalendarDays, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface BookingItem {
  id: number
  type: 'hotel' | 'car' | 'flight'
  name: string
  date: string
  status: string
  amount: number
  checkInDate?: string
  checkOutDate?: string
  startDate?: string
  endDate?: string
  expires_at?: string | null
  booking_type?: string
}

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: BookingItem[]
  totalAmount?: number
  getItemHref?: (item: BookingItem) => string
}

// Countdown hook
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(0)
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const diff = Math.max(0, target - now)
      return Math.floor(diff / 1000)
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return { timeLeft, minutes, seconds, isExpired: timeLeft <= 0 }
}

// Countdown timer component
function RideItemWithCountdown({ item, expiresAt, getDefaultItemHref, getItemHref, onClose, getStatusColor, getStatusIndicator, getTypeIcon, getCardBackground, formatDate }: {
  item: BookingItem
  expiresAt: Date | null
  getDefaultItemHref: (item: BookingItem) => string
  getItemHref?: (item: BookingItem) => string
  onClose: () => void
  getStatusColor: (status: string) => string
  getStatusIndicator: (status: string) => { icon: 'star' | 'dot'; colorClass: string }
  getTypeIcon: (type: string) => React.ReactNode
  getCardBackground: (item: BookingItem) => string
  formatDate: (dateString: string | undefined) => string
}) {
  const { minutes, seconds, isExpired } = useCountdown(expiresAt)
  const statusIndicator = getStatusIndicator(item.status)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="group"
    >
      <Link href={(getItemHref ? getItemHref(item) : getDefaultItemHref(item))} onClick={onClose}>
        <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/60 bg-gray-800/80 p-5 backdrop-blur-md transition-all duration-200 hover:border-cyan-300/80">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
            style={{ backgroundImage: `url(${getCardBackground(item)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/65 to-slate-900/70 pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-600/5 to-blue-600/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8 min-w-0">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                  {getTypeIcon(item.type)}
                </div>
                <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-cyan-300">
                  {item.name}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-cyan-300" />
                  {item.checkInDate || item.startDate
                    ? `${formatDate(item.checkInDate || item.startDate)} - ${formatDate(item.checkOutDate || item.endDate || '')}`
                    : formatDate(item.date)}
                </span>

                <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                  <Wallet className="h-4 w-4" />
                  PKR {item.amount?.toLocaleString() || '0'}
                </span>

                {expiresAt && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isExpired
                      ? 'border-red-400/50 bg-red-500/20 text-red-300 animate-pulse'
                      : minutes < 1
                      ? 'border-red-400/50 bg-red-500/20 text-red-300 animate-pulse'
                      : 'border-orange-400/50 bg-orange-500/20 text-orange-200'
                  }`}>
                    {isExpired ? 'Expired' : `${minutes}:${seconds.toString().padStart(2, '0')} left`}
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-start gap-3 lg:justify-end">
              {statusIndicator.icon === 'star' ? (
                <span className={`text-base leading-none ${statusIndicator.colorClass}`} aria-hidden="true">
                  ★
                </span>
              ) : (
                <span
                  className={`inline-block h-4 w-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.35)] ${statusIndicator.colorClass}`}
                  aria-hidden="true"
                />
              )}
              <div className={`rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap ${getStatusColor(item.status)}`}>
                {item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function StatsModal({ isOpen, onClose, title, data, totalAmount, getItemHref }: StatsModalProps) {
  const getDefaultItemHref = (item: BookingItem) => {
    if (item.type === 'hotel') {
      return `/client/bookings/hotel/${item.id}`
    }
    return '/client/cars/bookings'
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'checked_in':
      case 'in_progress':
        return 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white border-cyan-300/40'
      case 'pending_payment':
      case 'pending_driver_acceptance':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/50'
      case 'completed':
      case 'checked_out':
        return 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white border-cyan-300/40'
      case 'cancelled':
      case 'rejected':
        return 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white border-cyan-300/40'
      case 'accepted':
        return 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white border-cyan-300/40'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/40'
    }
  }

  const getStatusIndicator = (status: string): { icon: 'star' | 'dot'; colorClass: string } => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'checked_out':
        return { icon: 'star', colorClass: 'text-yellow-400' }
      case 'confirmed':
      case 'checked_in':
      case 'in_progress':
        return { icon: 'star', colorClass: 'text-emerald-400' }
      case 'cancelled':
      case 'rejected':
        return { icon: 'dot', colorClass: 'bg-red-500' }
      case 'accepted':
        return { icon: 'dot', colorClass: 'bg-emerald-500' }
      default:
        return { icon: 'dot', colorClass: 'bg-gray-400' }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Building2 className="h-5 w-5" />
      case 'car':
        return <CarFront className="h-5 w-5" />
      case 'flight':
        return <Plane className="h-5 w-5" />
      default:
        return <Plane className="h-5 w-5" />
    }
  }

  const carBackgrounds = [
    '/images/cars/car2.jpg',
    '/images/cars/car%203.jpg',
    '/images/cars/car%204.jpg',
    '/images/cars/car%205.jpg',
    '/images/cars/car%206.jpg',
    '/images/cars/car%207.jpg',
    '/images/cars/car%208.jpg',
  ]

  const hotelBackgrounds = [
    '/images/hotels/punjab/pearl-continental-lahore/main.jpg',
    '/images/hotels/sindh/movenpick-karachi/main.jpg',
    '/images/hotels/punjab/serena-hotel-islamabad/main.jpg',
    '/images/hotels/kpk/swat-serena-hotel/main.jpg',
    '/images/hotels/gilgit-baltistan/shangrila-resort-skardu/main.jpg',
    '/images/hotels/balochistan/pearl-continental-gwadar/main.jpg',
  ]

  const cityBackgrounds = [
    '/images/cities/karachi/karachi-03.png',
    '/images/cities/lahore/lahore-03.png',
    '/images/cities/islamabad/islamabad-03.jpg',
    '/images/cities/faisalabad/faisalabad-03.png',
    '/images/cities/multan/multan-03.png',
    '/images/cities/peshawar/peshawar-03.png',
  ]

  const getStableIndex = (seed: string, length: number) => {
    let hash = 0

    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }

    return hash % length
  }

  const getCardBackground = (item: BookingItem) => {
    const seed = `${item.id}-${item.type}-${item.name}`

    if (item.type === 'car') {
      return carBackgrounds[getStableIndex(seed, carBackgrounds.length)]
    }

    if (item.type === 'hotel') {
      return hotelBackgrounds[getStableIndex(seed, hotelBackgrounds.length)]
    }

    return cityBackgrounds[getStableIndex(seed, cityBackgrounds.length)]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div
                className="relative px-6 py-4"
                style={{
                  background: 'linear-gradient(135deg, #1a3590 0%, #077a98 50%, #0b7f78 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] bg-slate-950/65 p-6">
                {data.length > 0 ? (
                  <div className="space-y-4">
                    {data.map((item) => {
                      const isRideHailing = item.booking_type === 'ride_hailing'
                      const isPending = item.status === 'PENDING_DRIVER_ACCEPTANCE'
                      const expiresAt = isRideHailing && isPending && item.expires_at ? new Date(item.expires_at) : null
                      return (
                        <RideItemWithCountdown key={item.id} item={item} expiresAt={expiresAt} getDefaultItemHref={getDefaultItemHref} getItemHref={getItemHref} onClose={onClose} getStatusColor={getStatusColor} getStatusIndicator={getStatusIndicator} getTypeIcon={getTypeIcon} getCardBackground={getCardBackground} formatDate={formatDate} />
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4 flex justify-center">
                      <i className="fa-light fa-layer-group text-6xl text-gray-400"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No {title.toLowerCase()} found</h3>
                    <p className="text-gray-600 mb-6">
                      {title === 'Total Spent' 
                        ? 'You haven\'t made any bookings yet.'
                        : `You don't have any ${title.toLowerCase()} yet.`}
                    </p>
                    {/* Show Start Booking button only for specific booking types */}
                    {(title === 'Flight Booking' || title === 'Hotel Bookings' || title === 'Car Booking') && (
                      <Link href={
                        title === 'Flight Booking' ? '/client/flights' :
                        title === 'Hotel Bookings' ? '/client/hotels' :
                        title === 'Car Booking' ? '/client/cars' :
                        '/client/hotels'
                      }>
                        <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90">
                          Start Booking
                        </Button>
                      </Link>
                    )}
                    {/* For Total Trips and Total Spent, show different message */}
                    {(title === 'Total Trips' || title === 'Total Spent') && (
                      <div className="flex flex-col items-center space-y-4">
                        <p className="text-sm text-gray-500 max-w-md">
                          {title === 'Total Trips' 
                            ? 'Start planning your next adventure!'
                            : 'Begin your travel journey to see your spending here.'}
                        </p>
                        <Link href="/client/bookings">
                          <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90 px-6 py-2">
                            View All Bookings
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Total Amount Summary (for Total Spent) */}
                {(title === 'Total Spent' || title === 'Total Earnings') && data.length > 0 && totalAmount !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 pt-6 border-t-2 border-gray-200"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                      <span className="text-lg font-semibold text-gray-900">
                        {title === 'Total Earnings' ? 'Total Earnings:' : 'Total Amount Spent:'}
                      </span>
                      <span className="text-2xl font-bold text-green-700">PKR {totalAmount.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-cyan-300/30 bg-gradient-to-r from-[#1a3590] via-[#077a98] to-[#0b7f78]">
                <div className="flex items-center justify-end">
                  <Button
                    onClick={onClose}
                    className="relative -translate-y-2 rounded-xl border border-cyan-300/40 bg-gradient-to-r from-[#1e3a8a] via-[#0891b2] to-[#0d9488] px-6 py-2 text-white shadow-lg transition-opacity hover:opacity-90"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

