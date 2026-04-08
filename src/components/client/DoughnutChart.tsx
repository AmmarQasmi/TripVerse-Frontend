'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface DoughnutChartProps {
  label: string
  value: number | string
  gradient: string
  delay?: number
  onClick?: () => void
  subtitle?: string
  maxValue?: number // For percentage-based progress (used in listing pages)
}

export function DoughnutChart({ 
  label, 
  value, 
  gradient,
  delay = 0,
  onClick,
  subtitle,
  maxValue // NEW: For percentage-based progress
}: DoughnutChartProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [chartProgress, setChartProgress] = useState(0)
  const animationFrameRef = useRef<number>()

  // Parse numeric value if string contains PKR
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[PKR,\s$]/g, '')) || 0
    : value

  // Calculate progress percentage if maxValue is provided
  const progressPercentage = maxValue && maxValue > 0 
    ? Math.min((numericValue / maxValue) * 100, 100) 
    : 100 // Default to full if no maxValue

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

  // Chart dimensions
  const size = 200
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // Chart fills to 85% for visual appeal (not 100% to show it's a d1oughnut)
  const fillPercentage = 0.85
  // If maxValue is provided, scale the progress by percentage
  const effectiveProgress = maxValue ? (chartProgress * progressPercentage / 100) : chartProgress
  const offset = circumference - (effectiveProgress * circumference * fillPercentage)

  // Format value - handle PKR strings and currency labels
  const formatValue = (val: number) => {
    // Handle PKR string values
    if (typeof value === 'string' && value.includes('PKR')) {
      return { display: val > 0 ? Math.floor(val).toLocaleString() : '0', prefix: 'PKR', isCurrency: true }
    }
    
    // Handle currency labels
    if (label === 'Total Spent' || label === 'Total Revenue' || label.includes('Earnings') || label.includes('Revenue')) {
      // Format with K for thousands to fit better
      if (val >= 1000) {
        return { display: `${(val / 1000).toFixed(1)}K`, prefix: 'PKR', isCurrency: true }
      }
      return { display: Math.floor(val).toLocaleString(), prefix: 'PKR', isCurrency: true }
    }
    
    // Regular numeric values
    return { 
      display: val > 0 ? `${val.toLocaleString()}${numericValue > 0 ? '+' : ''}` : val.toString(), 
      prefix: '', 
      isCurrency: false 
    }
  }
  const formatted = formatValue(displayValue)

  // Use smaller center text for large currency values so they stay inside the ring
  const valueTextClass = formatted.isCurrency ? 'text-lg md:text-2xl' : 'text-3xl'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      className={`relative group flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onClick={onClick}
    >
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
            <linearGradient id={`outline-gradient-${label.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* Outer circle outline */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2 - 1}
            fill="none"
            stroke={`url(#outline-gradient-${label.replace(/\s+/g, '-')})`}
            strokeWidth={2}
          />
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* Center white fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            fill="white"
          />

          {/* Inner circle outline */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke={`url(#outline-gradient-${label.replace(/\s+/g, '-')})`}
            strokeWidth={2}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <motion.div 
            className={`${valueTextClass} font-bold text-center leading-tight`}
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
            {formatted.prefix ? (
              <div className="flex flex-col items-center justify-center w-full">
                <div className="animated-gradient-text leading-none">
                  {formatted.display}
                </div>
                <div className="animated-gradient-text text-xs md:text-sm mt-0.5 font-semibold">
                  {formatted.prefix}
                </div>
              </div>
            ) : (
              <span className="animated-gradient-text">
                {formatted.display}
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Label and Subtitle below */}
      <motion.div 
        className="text-sm mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: delay + 0.5,
          type: "spring",
          stiffness: 150
        }}
      >
        <span className="animated-gradient-text font-semibold">
          {label}
        </span>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
        )}
      </motion.div>
    </motion.div>
  )
}

