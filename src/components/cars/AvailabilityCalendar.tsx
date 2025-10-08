'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface AvailabilityCalendarProps {
  availability: CarAvailability[]
  onDateSelect?: (date: string) => void
  selectedStartDate?: string
  selectedEndDate?: string
  disabledDates?: string[]
}

interface CarAvailability {
  id: string
  carId: string
  date: string
  isAvailable: boolean
}

export function AvailabilityCalendar({ 
  availability, 
  onDateSelect, 
  selectedStartDate, 
  selectedEndDate,
  disabledDates = []
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const availabilityEntry = availability.find(a => a.date === dateString)
    return availabilityEntry?.isAvailable ?? true
  }

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return disabledDates.includes(dateString) || date < today
  }

  const isDateSelected = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return selectedStartDate === dateString || selectedEndDate === dateString
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false
    const dateString = date.toISOString().split('T')[0]
    return dateString >= selectedStartDate && dateString <= selectedEndDate
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDateClasses = (date: Date | null) => {
    if (!date) return 'h-10'
    
    const baseClasses = 'h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors cursor-pointer'
    
    if (isDateDisabled(date)) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`
    }
    
    if (isDateSelected(date)) {
      return `${baseClasses} bg-blue-500 text-white`
    }
    
    if (isDateInRange(date)) {
      return `${baseClasses} bg-blue-100 text-blue-700`
    }
    
    if (isDateAvailable(date)) {
      return `${baseClasses} hover:bg-gray-100 text-gray-900`
    } else {
      return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed`
    }
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date) || !isDateAvailable(date)) return
    const dateString = date.toISOString().split('T')[0]
    onDateSelect?.(dateString)
  }

  const unavailableDates = availability.filter(a => !a.isAvailable)

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <span className="mr-2">📅</span>
            Availability Calendar
          </CardTitle>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'calendar' ? (
          <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {getMonthName(currentMonth)}
              </h3>
              
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && handleDateClick(date)}
                    className={getDateClasses(date)}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span className="text-gray-600">Unavailable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Selected</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Unavailable Dates</h4>
            {unavailableDates.length > 0 ? (
              <div className="space-y-2">
                {unavailableDates.map((unavailable) => (
                  <div key={unavailable.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-red-800 font-medium">
                      {new Date(unavailable.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-red-600 text-sm">Unavailable</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No unavailable dates found</p>
                <p className="text-sm">This car is available for all dates</p>
              </div>
            )}
          </div>
        )}

        {/* Booking Note */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 text-sm">
            <span className="font-semibold">Note:</span> Availability is updated in real-time. 
            Book quickly to secure your dates!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
