'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface QuickToolCardProps {
  icon: string
  title: string
  description: string
  href: string
  gradient: string
  delay?: number
}

export function QuickToolCard({
  icon,
  title,
  description,
  href,
  gradient,
  delay = 0
}: QuickToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={href}>
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-teal-500/20 via-emerald-500/20 to-orange-400/20 border border-white/30 p-6 h-full shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/50">
          {/* TripVerse Brand Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-emerald-500/10 to-orange-400/10 group-hover:from-cyan-400/20 group-hover:via-emerald-500/20 group-hover:to-orange-400/20 transition-all duration-500" />
          
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-lime-400/20 to-orange-400/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10">
            {/* Icon */}
            <motion.div 
              className="text-5xl mb-4 filter drop-shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {icon}
            </motion.div>
            
            {/* Title */}
            <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-orange-500 bg-clip-text text-transparent mb-2 transition-colors">
              {title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
              {description}
            </p>
            
            {/* Open Button */}
            <div className="flex items-center text-teal-600 text-sm font-semibold group-hover:text-teal-700 transition-colors">
              <span>Open</span>
              <motion.svg 
                className="w-4 h-4 ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </div>
          </div>

          {/* Corner Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-400/30 via-emerald-400/30 to-transparent rounded-bl-full" />
        </div>
      </Link>
    </motion.div>
  )
}

