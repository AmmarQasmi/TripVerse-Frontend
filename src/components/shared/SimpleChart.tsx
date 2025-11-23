'use client'

import { useMemo } from 'react'

interface SimpleChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  type?: 'bar' | 'line' | 'area'
  height?: number
  showValues?: boolean
}

export function SimpleChart({ data, type = 'bar', height = 200, showValues = true }: SimpleChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  const colors = useMemo(() => {
    const defaultColors = [
      'rgba(59, 130, 246, 0.8)', // blue
      'rgba(16, 185, 129, 0.8)', // green
      'rgba(245, 158, 11, 0.8)', // yellow
      'rgba(239, 68, 68, 0.8)', // red
      'rgba(139, 92, 246, 0.8)', // purple
      'rgba(236, 72, 153, 0.8)', // pink
    ]
    return data.map((d, i) => d.color || defaultColors[i % defaultColors.length])
  }, [data])

  if (type === 'bar') {
    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <div className="flex items-end justify-between h-full gap-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-full flex items-end">
                  <div
                    className="w-full rounded-t transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: colors[index],
                      minHeight: item.value > 0 ? '4px' : '0',
                    }}
                  />
                  {showValues && item.value > 0 && (
                    <span
                      className="absolute text-xs font-semibold text-white whitespace-nowrap"
                      style={{
                        bottom: `${barHeight}%`,
                        transform: 'translateY(-100%)',
                        marginBottom: '4px',
                      }}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-300 mt-2 text-center truncate w-full" title={item.label}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (type === 'line' || type === 'area') {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * 100
      const y = 100 - (item.value / maxValue) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
            </linearGradient>
          </defs>
          {type === 'area' && (
            <polygon
              points={`0,100 ${points} 100,100`}
              fill="url(#gradient)"
            />
          )}
          <polyline
            points={points}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1 || 1)) * 100
            const y = 100 - (item.value / maxValue) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={colors[0]}
                className="hover:r-3 transition-all"
              />
            )
          })}
        </svg>
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-gray-300 truncate" title={item.label}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return null
}

