'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface BookingCalendarProps {
  selectedDate: string // YYYY-MM-DD
  onDateSelect: (date: string) => void
  unavailableDates: string[] // Array of YYYY-MM-DD strings
  numberOfDays: number
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

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  unavailableDates,
  numberOfDays,
  isLoading = false,
  error,
}: BookingCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateString(today)

  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates])

  // Check if a date range (date + numberOfDays) has any conflicts
  const hasConflict = (dateStr: string): boolean => {
    const start = new Date(dateStr)
    for (let i = 0; i < numberOfDays; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      if (unavailableSet.has(toDateString(d))) return true
    }
    return false
  }

  // Get the range of selected dates for highlighting
  const selectedRange = useMemo(() => {
    if (!selectedDate) return new Set<string>()
    const range = new Set<string>()
    const start = new Date(selectedDate)
    for (let i = 0; i < numberOfDays; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      range.add(toDateString(d))
    }
    return range
  }, [selectedDate, numberOfDays])

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
      isSelected: boolean
      isInRange: boolean
      isRangeStart: boolean
      isRangeEnd: boolean
      isToday: boolean
      hasRangeConflict: boolean
    }> = []

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth, -i)
      const ds = toDateString(d)
      days.push({
        date: d,
        dateStr: ds,
        isCurrentMonth: false,
        isPast: d < today,
        isUnavailable: unavailableSet.has(ds),
        isSelected: ds === selectedDate,
        isInRange: selectedRange.has(ds),
        isRangeStart: ds === selectedDate,
        isRangeEnd: false,
        isToday: ds === todayStr,
        hasRangeConflict: false,
      })
    }

    // Current month
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(viewYear, viewMonth, day)
      const ds = toDateString(d)
      const isPast = d < today
      const isUnavail = unavailableSet.has(ds)
      const rangeConflict = !isPast && !isUnavail && hasConflict(ds)

      days.push({
        date: d,
        dateStr: ds,
        isCurrentMonth: true,
        isPast,
        isUnavailable: isUnavail,
        isSelected: ds === selectedDate,
        isInRange: selectedRange.has(ds),
        isRangeStart: ds === selectedDate,
        isRangeEnd: selectedDate ? (() => {
          const end = new Date(selectedDate)
          end.setDate(end.getDate() + numberOfDays - 1)
          return ds === toDateString(end)
        })() : false,
        isToday: ds === todayStr,
        hasRangeConflict: rangeConflict,
      })
    }

    // Next month padding (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i)
      const ds = toDateString(d)
      days.push({
        date: d,
        dateStr: ds,
        isCurrentMonth: false,
        isPast: false,
        isUnavailable: unavailableSet.has(ds),
        isSelected: ds === selectedDate,
        isInRange: selectedRange.has(ds),
        isRangeStart: ds === selectedDate,
        isRangeEnd: false,
        isToday: ds === todayStr,
        hasRangeConflict: false,
      })
    }

    return days
  }, [viewMonth, viewYear, unavailableSet, selectedDate, selectedRange, numberOfDays, todayStr])

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  // Don't allow navigating before current month
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth())

  return (
    <div className="bg-gray-800/60 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
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
              const isClickable = !isDisabled && !day.hasRangeConflict

              return (
                <motion.button
                  key={i}
                  whileTap={isClickable ? { scale: 0.9 } : undefined}
                  onClick={() => {
                    if (isClickable) onDateSelect(day.dateStr)
                  }}
                  disabled={!isClickable}
                  className={`
                    relative h-8 rounded-md text-xs font-medium transition-all duration-100
                    flex items-center justify-center
                    ${!day.isCurrentMonth ? 'text-gray-700 cursor-default' : ''}
                    ${day.isPast && day.isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : ''}
                    ${day.isUnavailable && day.isCurrentMonth ? 'text-red-400/60 cursor-not-allowed line-through' : ''}
                    ${day.hasRangeConflict && day.isCurrentMonth ? 'text-yellow-400/70 cursor-not-allowed' : ''}
                    ${day.isSelected ? 'bg-teal-500 text-white font-bold ring-1 ring-teal-400/50' : ''}
                    ${day.isInRange && !day.isSelected ? 'bg-teal-500/20 text-teal-300' : ''}
                    ${isClickable && !day.isSelected && !day.isInRange ? 'text-gray-300 hover:bg-white/10 hover:text-white' : ''}
                    ${day.isToday && !day.isSelected ? 'ring-1 ring-teal-500/50' : ''}
                  `}
                  title={
                    day.isUnavailable
                      ? 'Booked'
                      : day.hasRangeConflict
                      ? `Selecting this date would overlap with a booking (${numberOfDays}-day trip)`
                      : day.isPast
                      ? 'Past date'
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
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
          <span className="text-[10px] text-gray-400">Selected</span>
        </div>
        {numberOfDays > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-500/20 border border-teal-500/30" />
            <span className="text-[10px] text-gray-400">Trip range</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-400/40" />
          <span className="text-[10px] text-gray-400">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border border-teal-500/50" />
          <span className="text-[10px] text-gray-400">Today</span>
        </div>
      </div>

      {error && (
        <div className="px-4 pb-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
