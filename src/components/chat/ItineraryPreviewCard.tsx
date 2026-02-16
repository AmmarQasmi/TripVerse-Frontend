'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface ItineraryPreviewCardProps {
  previewData: any
  itineraryId?: number
  onEnrich: (id: number) => Promise<any>
  isEnriching: boolean
}

export function ItineraryPreviewCard({
  previewData,
  itineraryId,
  onEnrich,
  isEnriching,
}: ItineraryPreviewCardProps) {
  const [enriched, setEnriched] = useState(false)
  const [enrichError, setEnrichError] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  const days = previewData?.days || []
  const destination = previewData?.destination || previewData?.title || 'Your Trip'
  const duration = previewData?.duration || previewData?.duration_days
    ? `${previewData.duration_days || days.length} days`
    : `${days.length} days`
  const budget = previewData?.budget_estimate || previewData?.budget || null
  const style = previewData?.travel_style || previewData?.style || null

  const handleEnrich = async () => {
    if (!itineraryId || isEnriching || enriched) return
    setEnrichError(null)
    try {
      await onEnrich(itineraryId)
      setEnriched(true)
    } catch {
      setEnrichError('Enrichment failed. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-[95%]"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4" />
          <h3 className="text-base font-bold truncate">{destination}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/80">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {duration}
          </span>
          {style && (
            <span className="px-1.5 py-0.5 bg-white/20 rounded-full">
              {style}
            </span>
          )}
          {budget && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {budget}
            </span>
          )}
        </div>
      </div>

      {/* Day overview */}
      <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
        {days.map((day: any, idx: number) => (
          <div key={idx}>
            <button
              onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {day.day || idx + 1}
                </span>
                <span className="font-medium text-gray-900 text-sm">{day.theme || day.title || `Day ${idx + 1}`}</span>
              </div>
              {expandedDay === idx ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            {expandedDay === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 pb-3 text-xs text-gray-600 space-y-1"
              >
                {day.morning && <p><span className="font-semibold text-amber-600">Morning:</span> {day.morning}</p>}
                {day.afternoon && <p><span className="font-semibold text-blue-600">Afternoon:</span> {day.afternoon}</p>}
                {day.evening && <p><span className="font-semibold text-indigo-600">Evening:</span> {day.evening}</p>}
                {day.food && <p><span className="font-semibold text-orange-600">Food:</span> {day.food}</p>}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Action footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        {enriched && itineraryId ? (
          <Link
            href={`/client/itinerary/${itineraryId}`}
            className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            Ready! View Full Itinerary
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : enrichError ? (
          <div className="space-y-2">
            <p className="text-xs text-red-500 text-center">{enrichError}</p>
            <button
              onClick={handleEnrich}
              disabled={isEnriching}
              className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        ) : (
          <button
            onClick={handleEnrich}
            disabled={isEnriching || !itineraryId}
            className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enriching with real data...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Full Itinerary
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}
