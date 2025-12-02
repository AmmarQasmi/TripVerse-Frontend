'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef, ReactNode } from 'react'

interface CircularStatsCardWithIconProps {
  label: string
  value: number | string
  subtitle?: string
  icon?: ReactNode
  delay?: number
  maxValue?: number // For calculating progress percentage
}

export function CircularStatsCardWithIcon({ 
  label, 
  value,
  subtitle,
  icon,
  delay = 0,
  maxValue = 100
}: CircularStatsCardWithIconProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [chartProgress, setChartProgress] = useState(0)
  const animationFrameRef = useRef<number>()

  // Parse numeric value if string contains PKR
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[PKR,\s]/g, '')) || 0
    : value

  // Calculate progress percentage (0-100%)
  const progressPercentage = maxValue > 0 ? Math.min((numericValue / maxValue) * 100, 100) : 0
  // Scale to 0-85% for visual appeal (same as DoughnutChart)
  const fillPercentage = 0.85

  // Animated counter and chart progress
  useEffect(() => {
    let start = 0
    const end = numericValue
    const duration = 1500 // 1.5 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = Math.floor(start + (end - start) * easeOutCubic)
      setDisplayValue(currentValue)
      setChartProgress(easeOutCubic)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(end)
        setChartProgress(1)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [numericValue])

  // Chart dimensions - match DoughnutChart exactly
  const size = 200
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (chartProgress * circumference * fillPercentage)

  // Format value display - handle PKR strings and numeric values
  const valueDisplay = (() => {
    // Handle PKR string values
    if (typeof value === 'string' && value.includes('PKR')) {
      return { 
        display: displayValue > 0 ? Math.floor(displayValue).toLocaleString() : '0', 
        prefix: 'PKR' 
      }
    }
    
    // Handle numeric values
    const formatted = displayValue > 0 
      ? `${Math.floor(displayValue).toLocaleString()}${numericValue > 0 ? '+' : ''}` 
      : '0'
    return { display: formatted, prefix: '' }
  })()

  // Split label into words for styling
  const labelWords = label.split(' ')
  const firstWord = labelWords[0]
  const restWords = labelWords.slice(1).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      className="relative group flex flex-col items-center"
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {/* Icon above chart */}
      {icon && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1, duration: 0.5 }}
          className="mb-4"
        >
          {icon}
        </motion.div>
      )}

      {/* Doughnut Chart */}
      <motion.div 
        className="relative w-full max-w-[200px] mx-auto aspect-square"
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ 
          delay: delay + 0.2, 
          duration: 0.8, 
          type: "spring", 
          stiffness: 150 
        }}
        whileHover={{ 
          scale: 1.1,
          transition: { duration: 0.3 }
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={`chart-gradient-${label.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          
          {/* Center white fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            fill="white"
          />
          
          {/* Progress circle - Homepage card gradient colors */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#chart-gradient-${label.replace(/\s+/g, '-')})`}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference, opacity: 0 }}
            animate={{ 
              strokeDashoffset: offset,
              opacity: 1
            }}
            transition={{ 
              strokeDashoffset: { duration: 1.5, ease: "easeOut" },
              opacity: { duration: 0.8, delay: delay + 0.3 }
            }}
            whileHover={{
              strokeWidth: strokeWidth + 4,
              transition: { duration: 0.2 }
            }}
          />
        </svg>
        
        {/* Number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-4xl font-bold"
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ 
              delay: delay + 0.4, 
              type: 'spring', 
              stiffness: 200,
              damping: 15
            }}
            whileHover={{
              scale: 1.2,
              transition: { duration: 0.2 }
            }}
          >
            {valueDisplay.prefix ? (
              <>
                <span className="text-[#0891b2]">{valueDisplay.prefix}</span>
                <span className={numericValue === 0 ? "text-gray-900" : "text-[#0891b2]"}>
                  {valueDisplay.display === '0' ? valueDisplay.display : ` ${valueDisplay.display}`}
                </span>
              </>
            ) : numericValue > 0 ? (
              <>
                <span className="text-[#0891b2]">{valueDisplay.display.replace(/\+$/, '')}</span>
                {valueDisplay.display.endsWith('+') && <span className="text-gray-900">+</span>}
              </>
            ) : (
              <span className="text-gray-900">{valueDisplay.display}</span>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Label and Subtitle below */}
      <motion.div 
        className="text-center mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: delay + 0.5,
          type: "spring",
          stiffness: 150
        }}
      >
        <div className="text-sm font-semibold">
          <span className="text-[#0891b2]">{firstWord}</span>
          {restWords && <span className="text-gray-900"> {restWords}</span>}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
        )}
      </motion.div>
    </motion.div>
  )
}

