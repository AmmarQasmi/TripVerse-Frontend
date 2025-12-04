'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface DoughnutChartProps {
  label: string
  value: number
  gradient: string
  delay?: number
  onClick?: () => void
}

export function DoughnutChart({ 
  label, 
  value, 
  gradient,
  delay = 0,
  onClick
}: DoughnutChartProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [chartProgress, setChartProgress] = useState(0)
  const animationFrameRef = useRef<number>()

  // Animated counter and chart progress
  useEffect(() => {
    let start = 0
    const end = value
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
  }, [value])

  // Chart dimensions
  const size = 200
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // Chart fills to 85% for visual appeal (not 100% to show it's a doughnut)
  const fillPercentage = 0.85
  const offset = circumference - (chartProgress * circumference * fillPercentage)

  // Format value
  const formatValue = (val: number) => {
    if (label === 'Total Spent' || label === 'Total Revenue') {
      return `$${val.toLocaleString()}`
    }
    return val > 0 ? `${val.toLocaleString()}${value > 0 ? '+' : ''}` : val.toString()
  }
  const formattedValue = formatValue(displayValue)

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
          </defs>
          
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
            <span className="animated-gradient-text">
              {formattedValue}
            </span>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Label below */}
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
      </motion.div>
    </motion.div>
  )
}

