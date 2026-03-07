'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { carsApi } from '@/lib/api/cars.api'
import { DriverModeStatus } from '@/types'

type DriverMode = 'OFFLINE' | 'RIDE_HAILING' | 'RENTAL'

interface DriverModeToggleProps {
  onModeChange?: (mode: DriverMode) => void
}

export function DriverModeToggle({ onModeChange }: DriverModeToggleProps) {
  const [currentMode, setCurrentMode] = useState<DriverMode>('OFFLINE')
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)
  const [modeStatus, setModeStatus] = useState<DriverModeStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [pendingMode, setPendingMode] = useState<DriverMode | null>(null)

  // Fetch current mode status
  useEffect(() => {
    const fetchModeStatus = async () => {
      try {
        setIsLoading(true)
        const status = await carsApi.getDriverModeStatus()
        setModeStatus(status)
        // Convert lowercase API mode to uppercase DriverMode
        const modeMap: Record<string, DriverMode> = {
          'offline': 'OFFLINE',
          'rental': 'RENTAL',
          'ride_hailing': 'RIDE_HAILING'
        }
        setCurrentMode(modeMap[status.current_mode] || 'OFFLINE')
      } catch (err: any) {
        console.error('Failed to fetch driver mode status:', err)
        setError('Failed to load status')
      } finally {
        setIsLoading(false)
      }
    }
    fetchModeStatus()
  }, [])

  const handleModeSwitch = async (newMode: DriverMode) => {
    if (newMode === currentMode || isSwitching) return

    // Check for active bookings
    if (modeStatus) {
      const hasActiveRentalBookings = modeStatus.active_rental_bookings > 0
      const hasActiveRideBookings = modeStatus.active_ride_hailing_bookings > 0

      // Warn if switching away from a mode with active bookings
      if (
        (currentMode === 'RENTAL' && hasActiveRentalBookings) ||
        (currentMode === 'RIDE_HAILING' && hasActiveRideBookings)
      ) {
        setPendingMode(newMode)
        setShowWarning(true)
        return
      }
    }

    await switchMode(newMode)
  }

  const switchMode = async (newMode: DriverMode) => {
    setIsSwitching(true)
    setError(null)
    setShowWarning(false)

    try {
      // Convert to lowercase for API
      const apiMode = newMode.toLowerCase() as 'offline' | 'rental' | 'ride_hailing'
      await carsApi.switchDriverMode(apiMode)
      setCurrentMode(newMode)
      onModeChange?.(newMode)
      
      // Refresh status
      const status = await carsApi.getDriverModeStatus()
      setModeStatus(status)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to switch mode')
    } finally {
      setIsSwitching(false)
      setPendingMode(null)
    }
  }

  const getModeConfig = (mode: DriverMode) => {
    switch (mode) {
      case 'OFFLINE':
        return {
          label: 'Offline',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
            </svg>
          ),
          color: 'bg-gray-500',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
        }
      case 'RIDE_HAILING':
        return {
          label: 'Accepting Rides',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          color: 'bg-teal-500',
          bgColor: 'bg-teal-100',
          textColor: 'text-teal-700',
        }
      case 'RENTAL':
        return {
          label: 'Available for Rentals',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          color: 'bg-blue-500',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
        }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex gap-3">
            <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
            <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
            <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    )
  }

  const currentConfig = getModeConfig(currentMode)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Current Status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Driver Mode</h3>
          <p className="text-sm text-gray-500">Control your availability</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentConfig.bgColor}`}>
          <span className={`w-2 h-2 rounded-full ${currentMode === 'OFFLINE' ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`}></span>
          <span className={`font-medium ${currentConfig.textColor}`}>{currentConfig.label}</span>
        </div>
      </div>

      {/* Mode Toggles */}
      <div className="flex gap-3">
        {(['OFFLINE', 'RIDE_HAILING', 'RENTAL'] as DriverMode[]).map((mode) => {
          const config = getModeConfig(mode)
          const isActive = currentMode === mode
          const bookingCount = mode === 'RIDE_HAILING' 
            ? modeStatus?.active_ride_hailing_bookings ?? 0
            : mode === 'RENTAL'
              ? modeStatus?.active_rental_bookings ?? 0
              : 0

          return (
            <motion.button
              key={mode}
              onClick={() => handleModeSwitch(mode)}
              disabled={isSwitching}
              whileHover={{ scale: isActive ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all relative ${
                isActive
                  ? `${config.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                {config.icon}
                <span className="text-sm">{config.label}</span>
                {bookingCount > 0 && mode !== 'OFFLINE' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {bookingCount} active
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Active Bookings Summary */}
      {modeStatus && (modeStatus.active_rental_bookings > 0 || modeStatus.active_ride_hailing_bookings > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {modeStatus.active_rental_bookings > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">Active Rentals</p>
              <p className="text-lg font-bold text-blue-700">{modeStatus.active_rental_bookings}</p>
            </div>
          )}
          {modeStatus.active_ride_hailing_bookings > 0 && (
            <div className="bg-teal-50 rounded-lg p-3">
              <p className="text-xs text-teal-600 font-medium">Active Rides</p>
              <p className="text-lg font-bold text-teal-700">{modeStatus.active_ride_hailing_bookings}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && pendingMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Active Bookings Warning</h4>
              </div>
              <p className="text-gray-600 mb-6">
                You have active bookings in your current mode. Switching modes won&apos;t cancel them, 
                but you won&apos;t receive new bookings of this type until you switch back.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => switchMode(pendingMode)}
                  disabled={isSwitching}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSwitching ? 'Switching...' : 'Switch Anyway'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
