'use client'

import { Cloud, Thermometer, Droplets, Wind, Sun } from 'lucide-react'

interface WeatherBarProps {
  data: any
  destination: string
}

export function WeatherBar({ data, destination }: WeatherBarProps) {
  if (!data) return null

  const temperature = data.temperature || data.temp || data.current?.temperature
  const description = data.description || data.condition || data.current?.description
  const humidity = data.humidity || data.current?.humidity
  const windSpeed = data.wind_speed || data.windSpeed || data.current?.windSpeed
  const forecast = data.forecast || data.daily || []

  return (
    <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-b border-sky-100">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800 block leading-tight">
                Weather in {destination}
              </span>
              {description && (
                <span className="text-xs text-gray-500">{description}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {temperature !== undefined && (
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-red-400" />
                <span className="text-lg font-bold text-gray-800">{temperature}°C</span>
              </div>
            )}

            {humidity !== undefined && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span>{humidity}%</span>
              </div>
            )}

            {windSpeed !== undefined && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Wind className="w-4 h-4 text-teal-400" />
                <span>{windSpeed} km/h</span>
              </div>
            )}
          </div>
        </div>

        {/* Forecast pills */}
        {forecast.length > 0 && (
          <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {forecast.slice(0, 7).map((day: any, idx: number) => (
              <div
                key={idx}
                className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl px-3.5 py-2.5 text-center text-xs border border-white shadow-sm min-w-[72px] hover:shadow-md transition-shadow"
              >
                <p className="font-bold text-gray-700">
                  {day.date ? new Date(day.date).toLocaleDateString('en', { weekday: 'short' }) : `Day ${idx + 1}`}
                </p>
                <p className="text-gray-500 mt-1 font-medium">
                  {day.temperature?.max || day.max_temp || day.high || '—'}° / {day.temperature?.min || day.min_temp || day.low || '—'}°
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
