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

  // Format value with + if needed
  const formattedValue = value > 0 ? `${value.toLocaleString()}+` : value.toString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative group"
    >
      <motion.div 
        className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 backdrop-blur-md opacity-95 shadow-2xl hover:scale-105 hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 overflow-hidden"
        whileHover={{ scale: 1.02 }}
        style={{
          border: '2px solid transparent',
          backgroundImage: `
            linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      >
        {/* Animated Neon Border - TripVerse Theme */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            opacity: 0.9,
            filter: 'blur(1px)',
            zIndex: -1,
            border: '2px solid transparent',
            backgroundClip: 'border-box'
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Outer Glow Effect */}
        <motion.div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            filter: 'blur(3px)',
            opacity: 0.4,
            zIndex: -2
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Corner Highlights */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>
        
        {/* Inner Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="text-3xl">{icon}</div>
            <div className="text-right">
              <motion.div 
                className="text-4xl font-bold text-white mb-1"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
              >
                {displayValue > 0 ? `${displayValue.toLocaleString()}+` : displayValue.toString()}
              </motion.div>
              <div className="text-cyan-300 text-sm">{label}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

