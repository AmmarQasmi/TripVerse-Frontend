'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'

interface HotelBookingCalendarProps {
  checkIn: string        // YYYY-MM-DD
  checkOut: string       // YYYY-MM-DD
  onCheckInSelect: (date: string) => void
  onCheckOutSelect: (date: string) => void
  unavailableDates: string[] // Array of YYYY-MM-DD strings (fully booked)
  isLoading?: boolean
  error?: string
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function HotelBookingCalendar({
  checkIn,
  checkOut,
  onCheckInSelect,
  onCheckOutSelect,
  unavailableDates,
  isLoading = false,
  error,
}: HotelBookingCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateString(today)

  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  // Track which date is being picked: 'checkIn' or 'checkOut'
  const [pickingMode, setPickingMode] = useState<'checkIn' | 'checkOut'>('checkIn')
  // Hover date for preview
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates])

  // Check if a range has any unavailable dates in between
  const rangeHasConflict = useCallback((start: string, end: string): boolean => {
    const s = new Date(start)
    const e = new Date(end)
    const current = new Date(s)
    current.setDate(current.getDate() + 1) // Don't check check-in day itself, check days in between
    while (current < e) {
      if (unavailableSet.has(toDateString(current))) return true
      current.setDate(current.getDate() + 1)
    }
    return false
  }, [unavailableSet])

  // Selected range for highlighting
  const selectedRange = useMemo(() => {
    if (!checkIn || !checkOut) return new Set<string>()
    const range = new Set<string>()
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const current = new Date(start)
    while (current <= end) {
      range.add(toDateString(current))
      current.setDate(current.getDate() + 1)
    }
    return range
  }, [checkIn, checkOut])

  // Preview range on hover (when picking check-out)
  const previewRange = useMemo(() => {
    if (pickingMode !== 'checkOut' || !checkIn || !hoverDate) return new Set<string>()
    if (hoverDate <= checkIn) return new Set<string>()
    const range = new Set<string>()
    const start = new Date(checkIn)
    const end = new Date(hoverDate)
    const current = new Date(start)
    while (current <= end) {
      range.add(toDateString(current))
      current.setDate(current.getDate() + 1)
    }
    return range
  }, [pickingMode, checkIn, hoverDate])

  const handleDateClick = (dateStr: string) => {
    if (pickingMode === 'checkIn') {
      onCheckInSelect(dateStr)
      onCheckOutSelect('') // Reset check-out when check-in changes
      setPickingMode('checkOut')
    } else {
      // Picking check-out
      if (dateStr <= checkIn) {
        // If clicked date is before or equal to check-in, reset and set it as new check-in
        onCheckInSelect(dateStr)
        onCheckOutSelect('')
        setPickingMode('checkOut')
      } else if (rangeHasConflict(checkIn, dateStr)) {
        // Don't allow selecting a range with unavailable dates
        return
      } else {
        onCheckOutSelect(dateStr)
        setPickingMode('checkIn') // Done, reset mode
      }
    }
  }

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: Array<{
      date: Date
      dateStr: string
      isCurrentMonth: boolean
      isPast: boolean
      isUnavailable: boolean
      isCheckIn: boolean
      isCheckOut: boolean
      isInRange: boolean
      isInPreview: boolean
      isToday: boolean
    }> = []

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth, -i)
      const ds = toDateString(d)
      days.push({
        date: d, dateStr: ds, isCurrentMonth: false,
        isPast: d < today, isUnavailable: unavailableSet.has(ds),
        isCheckIn: ds === checkIn, isCheckOut: ds === checkOut,
        isInRange: selectedRange.has(ds), isInPreview: previewRange.has(ds),
        isToday: ds === todayStr,
      })
    }

    // Current month
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(viewYear, viewMonth, day)
      const ds = toDateString(d)
      days.push({
        date: d, dateStr: ds, isCurrentMonth: true,
        isPast: d < today, isUnavailable: unavailableSet.has(ds),
        isCheckIn: ds === checkIn, isCheckOut: ds === checkOut,
        isInRange: selectedRange.has(ds), isInPreview: previewRange.has(ds),
        isToday: ds === todayStr,
      })
    }

    // Next month padding (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i)
      const ds = toDateString(d)
      days.push({
        date: d, dateStr: ds, isCurrentMonth: false,
        isPast: false, isUnavailable: unavailableSet.has(ds),
        isCheckIn: ds === checkIn, isCheckOut: ds === checkOut,
        isInRange: selectedRange.has(ds), isInPreview: previewRange.has(ds),
        isToday: ds === todayStr,
      })
    }

    return days
  }, [viewMonth, viewYear, unavailableSet, checkIn, checkOut, selectedRange, previewRange, todayStr])

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth())

  // Calculate nights from selected range
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const ci = new Date(checkIn)
    const co = new Date(checkOut)
    return Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24))
  }, [checkIn, checkOut])

  return (
    <div className="bg-gray-800/60 rounded-xl border border-white/10 overflow-hidden">
      {/* Picking mode indicator */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800/80 border-b border-white/5">
        <button
          type="button"
          onClick={() => setPickingMode('checkIn')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            pickingMode === 'checkIn'
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
              : 'border-gray-600/40 text-gray-400 hover:text-gray-300'
          }`}
        >
          <span className="block text-[10px] uppercase tracking-wider mb-0.5 opacity-70">Check-in</span>
          {checkIn || 'Select date'}
        </button>
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <button
          type="button"
          onClick={() => { if (checkIn) setPickingMode('checkOut') }}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            pickingMode === 'checkOut'
              ? 'bg-teal-500/15 border-teal-500/40 text-teal-400'
              : !checkIn
              ? 'border-gray-700/40 text-gray-600 cursor-not-allowed'
              : 'border-gray-600/40 text-gray-400 hover:text-gray-300'
          }`}
          disabled={!checkIn}
        >
          <span className="block text-[10px] uppercase tracking-wider mb-0.5 opacity-70">Check-out</span>
          {checkOut || (checkIn ? 'Select date' : '—')}
        </button>
        {nights > 0 && (
          <div className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg border border-cyan-500/20 flex-shrink-0">
            <span className="text-xs font-bold text-cyan-400">
              {nights} night{nights !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Month navigation header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h4 className="text-sm font-semibold text-white">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h4>
        <button
          type="button"
          onClick={goToNextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-5 w-5 text-teal-400 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-gray-400">Loading availability...</span>
        </div>
      )}

      {!isLoading && (
        <div className="p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, i) => {
              const isDisabled = day.isPast || day.isUnavailable || !day.isCurrentMonth
              const isClickable = !isDisabled

              // Check if hovering would create a conflict (only when picking checkout)
              const hoverConflict = pickingMode === 'checkOut' && checkIn && !isDisabled && day.dateStr > checkIn
                ? rangeHasConflict(checkIn, day.dateStr)
                : false

              return (
                <motion.button
                  key={i}
                  type="button"
                  whileTap={isClickable && !hoverConflict ? { scale: 0.9 } : undefined}
                  onClick={() => {
                    if (isClickable && !hoverConflict) handleDateClick(day.dateStr)
                  }}
                  onMouseEnter={() => {
                    if (isClickable) setHoverDate(day.dateStr)
                  }}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={!isClickable}
                  className={`
                    relative h-8 rounded-md text-xs font-medium transition-all duration-100
                    flex items-center justify-center
                    ${!day.isCurrentMonth ? 'text-gray-700 cursor-default' : ''}
                    ${day.isPast && day.isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : ''}
                    ${day.isUnavailable && day.isCurrentMonth ? 'text-red-400/60 cursor-not-allowed line-through' : ''}
                    ${hoverConflict && day.isCurrentMonth ? 'text-yellow-400/70 cursor-not-allowed' : ''}
                    ${day.isCheckIn ? 'bg-cyan-500 text-white font-bold ring-1 ring-cyan-400/50 rounded-r-none' : ''}
                    ${day.isCheckOut ? 'bg-teal-500 text-white font-bold ring-1 ring-teal-400/50 rounded-l-none' : ''}
                    ${day.isInRange && !day.isCheckIn && !day.isCheckOut ? 'bg-cyan-500/15 text-cyan-300 rounded-none' : ''}
                    ${day.isInPreview && !day.isCheckIn ? 'bg-cyan-500/10 text-cyan-300/70 rounded-none' : ''}
                    ${isClickable && !day.isCheckIn && !day.isCheckOut && !day.isInRange && !day.isInPreview && !hoverConflict ? 'text-gray-300 hover:bg-white/10 hover:text-white' : ''}
                    ${day.isToday && !day.isCheckIn && !day.isCheckOut ? 'ring-1 ring-cyan-500/50' : ''}
                  `}
                  title={
                    day.isUnavailable
                      ? 'Fully booked'
                      : hoverConflict
                      ? 'Unavailable dates in range'
                      : day.isPast
                      ? 'Past date'
                      : day.isCheckIn
                      ? 'Check-in'
                      : day.isCheckOut
                      ? 'Check-out'
                      : undefined
                  }
                >
                  {day.date.getDate()}
                  {/* Unavailable dot indicator */}
                  {day.isUnavailable && day.isCurrentMonth && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
          <span className="text-[10px] text-gray-400">Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
          <span className="text-[10px] text-gray-400">Check-out</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/15 border border-cyan-500/30" />
          <span className="text-[10px] text-gray-400">Stay range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-400/40" />
          <span className="text-[10px] text-gray-400">Fully booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border border-cyan-500/50" />
          <span className="text-[10px] text-gray-400">Today</span>
        </div>
      </div>

      {/* Instruction text */}
      <div className="px-4 pb-2.5">
        <p className="text-[10px] text-gray-500 italic">
          {pickingMode === 'checkIn'
            ? '← Select your check-in date'
            : '← Now select your check-out date'}
        </p>
      </div>

      {error && (
        <div className="px-4 pb-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
