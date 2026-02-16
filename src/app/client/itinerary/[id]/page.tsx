'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  Sparkles,
  Share2,
  Download,
  Cloud,
  AlertCircle,
  Compass,
  Clock,
  CheckCircle2,
  Luggage,
} from 'lucide-react'
import { itinerariesApi } from '@/lib/api/itineraries.api'
import { GeneratedItinerary } from '@/types'
import { DayTimeline } from '@/components/chat/DayTimeline'
import { WeatherBar } from '@/components/chat/WeatherBar'
import { PackingSection } from '@/components/chat/PackingSection'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useAuth } from '@/features/auth/useAuth'
import { useToast } from '@/components/ui/Toast'

/* Unsplash hero images for destinations */
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=80',
]

function getHeroImage(dest: string) {
  const hash = dest.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return HERO_IMAGES[hash % HERO_IMAGES.length]
}

function ItineraryPageContent() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const id = Number(params.id)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const { data: itinerary, isLoading, error } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => itinerariesApi.get(id),
    enabled: !!id && !!user,
    staleTime: 10_000,
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedItinerary | undefined
      return data?.status === 'enriching' ? 5000 : false
    },
  })

  const enrichMutation = useMutation({
    mutationFn: () => itinerariesApi.enrich(id),
    onSuccess: () => {
      showToast('Itinerary enriched with real data!', 'success')
      queryClient.invalidateQueries({ queryKey: ['itinerary', id] })
      queryClient.invalidateQueries({ queryKey: ['itineraries'] })
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Enrichment failed. Please try again.', 'error')
      queryClient.invalidateQueries({ queryKey: ['itinerary', id] })
    },
  })

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-200">
              <Compass className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium">Loading your adventure</p>
            <p className="text-gray-400 text-sm mt-1">Preparing your itinerary...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-sm mx-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Itinerary not found</h2>
          <p className="text-sm text-gray-500 mb-5">This itinerary may have been deleted or you don't have access.</p>
          <button
            onClick={() => router.push('/client/dashboard')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-200 hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  const displayData = itinerary.enrichedData || itinerary.previewData
  const isEnriched = itinerary.status === 'complete' && !!itinerary.enrichedData
  const days = displayData?.days || displayData?.itinerary?.days || []
  const weatherData = displayData?.weather || null
  const packingList = displayData?.packing_recommendations || displayData?.packing || null
  const destination = itinerary.destination
  const title = itinerary.title || `Trip to ${destination}`

  // Count total places across all days
  const totalPlaces = days.reduce((sum: number, d: any) => {
    return sum + (d.places?.length || 0)
  }, 0)

  const statusLabel = isEnriched ? 'Enriched' : itinerary.status === 'enriching' ? 'Enriching...' : itinerary.status === 'preview' ? 'AI Preview' : itinerary.status === 'failed' ? 'Failed' : 'Preview'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero with destination image */}
      <div className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={getHeroImage(destination)}
            alt={destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
        </div>

        <div className="relative container mx-auto px-4 pt-6 pb-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push('/client/dashboard')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                isEnriched
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                  : itinerary.status === 'failed'
                  ? 'bg-red-500/30 text-red-200 border border-red-400/30'
                  : 'bg-white/20 text-white/90 border border-white/20'
              }`}>
                {isEnriched && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="text-white/70 text-base mb-6 max-w-lg">
              Your personalized travel plan — {days.length} days of curated experiences in {destination}.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                <MapPin className="w-4 h-4 text-cyan-300" />
                <span className="text-sm text-white font-medium">{destination}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                <Calendar className="w-4 h-4 text-amber-300" />
                <span className="text-sm text-white font-medium">{itinerary.durationDays} Days</span>
              </div>
              {totalPlaces > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                  <Compass className="w-4 h-4 text-emerald-300" />
                  <span className="text-sm text-white font-medium">{totalPlaces} Places</span>
                </div>
              )}
              {itinerary.travelStyle && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                  <Luggage className="w-4 h-4 text-violet-300" />
                  <span className="text-sm text-white font-medium capitalize">{itinerary.travelStyle}</span>
                </div>
              )}
              {itinerary.budget && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                  <DollarSign className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-white font-medium">{itinerary.budget}</span>
                </div>
              )}
            </div>

            {/* Enrich CTA */}
            {itinerary.status === 'preview' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => enrichMutation.mutate()}
                disabled={enrichMutation.isPending}
                className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
              >
                {enrichMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enriching with real data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Enrich with Photos, Maps & Reviews
                  </>
                )}
              </motion.button>
            )}

            {itinerary.status === 'enriching' && (
              <div className="flex items-center gap-2 text-cyan-200 text-sm bg-cyan-500/20 px-4 py-2.5 rounded-xl border border-cyan-400/30 backdrop-blur-sm w-fit">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enrichment in progress — photos, maps & reviews loading...
              </div>
            )}

            {itinerary.status === 'failed' && (
              <button
                onClick={() => enrichMutation.mutate()}
                disabled={enrichMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/30 hover:bg-red-500/40 text-white rounded-xl text-sm font-semibold backdrop-blur-sm transition-all border border-red-400/30"
              >
                <AlertCircle className="w-4 h-4" />
                Enrichment failed — Retry
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Weather Bar */}
      {weatherData && (
        <WeatherBar data={weatherData} destination={destination} />
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Day-by-Day Itinerary</h2>
            <p className="text-sm text-gray-500">{days.length} days planned with {totalPlaces} places to visit</p>
          </div>
        </motion.div>

        {days.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Compass className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No day data available</p>
            <p className="text-gray-400 text-sm mt-1">This itinerary doesn't have detailed day plans yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {days.map((day: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
              >
                <DayTimeline
                  day={day}
                  dayNumber={day.day || idx + 1}
                  isEnriched={isEnriched}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Packing Recommendations */}
        {packingList && <PackingSection data={packingList} />}

        {/* Export / Share */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export / Print
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              showToast('Link copied to clipboard!', 'success')
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            Share Itinerary
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <ErrorBoundary fallbackMessage="Failed to load itinerary. It may have been deleted or you may not have access.">
      <ItineraryPageContent />
    </ErrorBoundary>
  )
}
