'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Sun,
  Cloud,
  Moon,
  Utensils,
  Gauge,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Calendar,
} from 'lucide-react'
import { ItineraryData, ItineraryDay } from '@/types'

interface ItineraryDisplayProps {
  data: ItineraryData
}

export function ItineraryDisplay({ data }: ItineraryDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  const toggleDay = (dayIdx: number) => {
    setExpandedDay(expandedDay === dayIdx ? null : dayIdx)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-5 py-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-5 h-5" />
          <h3 className="text-lg font-bold">{data.destination}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/80">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {data.duration}
          </span>
          {data.style && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {data.style}
            </span>
          )}
        </div>
      </div>

      {/* Days */}
      <div className="divide-y divide-gray-100">
        {data.days?.map((day: ItineraryDay, idx: number) => (
          <div key={idx}>
            <button
              onClick={() => toggleDay(idx)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {day.day}
                </span>
                <span className="font-semibold text-gray-900 text-sm">{day.theme}</span>
              </div>
              {expandedDay === idx ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedDay === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 space-y-3">
                    <TimeSlot
                      icon={<Sun className="w-4 h-4 text-amber-500" />}
                      label="Morning"
                      text={day.morning}
                    />
                    <TimeSlot
                      icon={<Cloud className="w-4 h-4 text-blue-500" />}
                      label="Afternoon"
                      text={day.afternoon}
                    />
                    <TimeSlot
                      icon={<Moon className="w-4 h-4 text-indigo-500" />}
                      label="Evening"
                      text={day.evening}
                    />
                    <TimeSlot
                      icon={<Utensils className="w-4 h-4 text-orange-500" />}
                      label="Food"
                      text={day.food}
                    />
                    {day.pacing && (
                      <TimeSlot
                        icon={<Gauge className="w-4 h-4 text-teal-500" />}
                        label="Pacing"
                        text={day.pacing}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Tips */}
      {data.tips && data.tips.length > 0 && (
        <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Travel Tips</span>
          </div>
          <ul className="space-y-1">
            {data.tips.map((tip: string, i: number) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                <span className="mt-1 w-1 h-1 bg-amber-400 rounded-full flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function TimeSlot({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode
  label: string
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
