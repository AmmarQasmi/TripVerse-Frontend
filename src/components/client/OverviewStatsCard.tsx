'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface OverviewStatsCardProps {
  icon: string
  label: string
  value: number
  gradient: string
  delay?: number
}

export function OverviewStatsCard({ 
  icon, 
  label, 
  value, 
  gradient,
  delay = 0 
}: OverviewStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Animated counter
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1500
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      {/* Glassmorphic Card */}
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-orange-400/20 border border-white/30 p-6 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/50">
        {/* TripVerse Brand Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-emerald-500/10 to-orange-400/10 group-hover:from-teal-400/20 group-hover:via-emerald-500/20 group-hover:to-orange-400/20 transition-all duration-500" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-lime-400/20 to-orange-400/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700" />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="text-4xl mb-3 filter drop-shadow-lg">{icon}</div>
          
          {/* Value with Animated Counter */}
          <motion.div 
            className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-orange-500 bg-clip-text text-transparent mb-1"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
          >
            {displayValue.toLocaleString()}
          </motion.div>
          
          {/* Label */}
          <div className="text-sm text-gray-700 font-medium">{label}</div>
        </div>

        {/* Decorative Corner Accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-400/30 via-emerald-400/30 to-transparent rounded-bl-full" />
      </div>
    </motion.div>
  )
}

