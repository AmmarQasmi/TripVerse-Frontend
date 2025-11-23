'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  delay?: number
  className?: string
  onClick?: () => void
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
  className = '',
  onClick,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={`shadow-lg bg-white/10 backdrop-blur-md border-white/20 ${
          onClick ? 'cursor-pointer hover:border-white/40 transition-all duration-300' : ''
        } ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-300">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
              {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {icon && <div className="text-4xl">{icon}</div>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

