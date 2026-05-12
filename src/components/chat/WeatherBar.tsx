'use client'

import { Cloud, Thermometer, Droplets, Wind, Sun, Moon } from 'lucide-react'

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
  const high = data.high || data.high_temp || data.current?.high
  const low = data.low || data.low_temp || data.current?.low
  const forecast = data.forecast || data.daily || []

  return (
    <div style={{ background: '#0f2d44', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 22px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0px' }}>
      {/* Temp block */}
      <div style={{ marginRight: '24px' }}>
        <div style={{ color: '#2dd4bf', fontSize: '26px', fontWeight: 700, lineHeight: 1 }}>
          {temperature}°C
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '2px' }}>
          {description} · {destination}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '38px', background: 'rgba(255,255,255,0.12)', marginRight: '24px' }} />

      {/* Stats */}
      {humidity !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginRight: '20px' }}>
          <span style={{ color: '#2dd4bf' }}><Droplets className="w-3.5 h-3.5" /></span>
          {humidity}% humidity
        </div>
      )}

      {windSpeed !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginRight: '20px' }}>
          <span style={{ color: '#2dd4bf' }}><Wind className="w-3.5 h-3.5" /></span>
          {windSpeed} km/h wind
        </div>
      )}

      {high !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginRight: '20px' }}>
          <span style={{ color: '#2dd4bf' }}><Sun className="w-3.5 h-3.5" /></span>
          High {high}°C
        </div>
      )}

      {low !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginRight: '20px' }}>
          <span style={{ color: '#2dd4bf' }}><Moon className="w-3.5 h-3.5" /></span>
          Low {low}°C
        </div>
      )}
    </div>
  )
}
