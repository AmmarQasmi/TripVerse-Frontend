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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: 1.01,
      }}
      className="group"
    >
      <Link href={href}>
        <div 
          className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 h-full p-8"
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
            <h3 className="text-xl font-bold text-white mb-2">
              {title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-cyan-300 mb-4 line-clamp-2">
              {description}
            </p>
            
            {/* Open Button */}
            <div className="flex items-center text-cyan-300 text-sm font-semibold group-hover:text-cyan-200 transition-colors">
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
        </div>
      </Link>
    </motion.div>
  )
}

