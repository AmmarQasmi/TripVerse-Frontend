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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f2d44' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: '#2dd4bf' }}>
              <Compass className="w-8 h-8 text-[#0f2d44] animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-medium" style={{ color: '#fff' }}>Loading your adventure</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Preparing your itinerary...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
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
            className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            style={{ background: '#2dd4bf' }}
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
    <div style={{ background: '#0a1a2e', minHeight: '100vh' }}>
      {/* Hero section */}
      <div style={{ background: 'linear-gradient(135deg, #0a1a2e 0%, #0d2b3e 100%)', padding: '22px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: '100%' }}>
          {/* Top bar */}
          <div className="flex items-center justify-center mb-10">
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => router.push('/client/dashboard')}
                className="flex items-center gap-2 text-sm px-3.5 py-1.5 rounded-lg transition-colors"
                style={{ color: '#fff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#2dd4bf', background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.4)', padding: '5px 12px', borderRadius: '20px' }}>
                <CheckCircle2 className="w-3 h-3" /> {statusLabel}
              </div>
            </div>
          </div>

          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <h1 style={{ color: '#fff', fontSize: '30px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: '10px' }}>
              {title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginBottom: '20px' }}>
              Your personalized travel plan — {days.length} days of curated experiences in {destination}.
            </p>

            {/* Stat chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)', fontSize: '12px', padding: '6px 13px', borderRadius: '20px' }}>
                <span style={{ color: '#2dd4bf' }}><MapPin className="w-3 h-3" /></span>
                {destination}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)', fontSize: '12px', padding: '6px 13px', borderRadius: '20px' }}>
                <span style={{ color: '#2dd4bf' }}><Calendar className="w-3 h-3" /></span>
                {itinerary.durationDays} Days
              </div>
              {totalPlaces > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)', fontSize: '12px', padding: '6px 13px', borderRadius: '20px' }}>
                  <span style={{ color: '#2dd4bf' }}><Compass className="w-3 h-3" /></span>
                  {totalPlaces} Places
                </div>
              )}
              {itinerary.travelStyle && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)', fontSize: '12px', padding: '6px 13px', borderRadius: '20px' }}>
                  <span style={{ color: '#2dd4bf' }}><Luggage className="w-3 h-3" /></span>
                  {itinerary.travelStyle.charAt(0).toUpperCase() + itinerary.travelStyle.slice(1)}
                </div>
              )}
              {itinerary.budget && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)', fontSize: '12px', padding: '6px 13px', borderRadius: '20px' }}>
                  <span style={{ color: '#2dd4bf' }}><DollarSign className="w-3 h-3" /></span>
                  {itinerary.budget}
                </div>
              )}
            </div>

            {/* Enrich CTA */}
            {itinerary.status === 'preview' && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#0d2b3e', borderRadius: '12px', border: '1px solid rgba(45,212,191,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Enhance Your Itinerary</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>Add real photos, maps, reviews & live data</p>
                </div>
                <button
                  onClick={() => enrichMutation.mutate()}
                  disabled={enrichMutation.isPending}
                  style={{ background: '#2dd4bf', color: '#0d2b3e', fontWeight: 700, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {enrichMutation.isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Enrich Now
                    </>
                  )}
                </button>
              </div>
            )}

            {itinerary.status === 'enriching' && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(45,212,191,0.1)', borderRadius: '12px', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#2dd4bf' }} />
                <p style={{ color: '#0d2b3e', fontSize: '14px', fontWeight: 500 }}>Enriching your itinerary…</p>
              </div>
            )}

            {itinerary.status === 'failed' && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ color: '#b91c1c', fontSize: '14px' }}>Enrichment failed. Please try again.</p>
                <button
                  onClick={() => enrichMutation.mutate()}
                  style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}
                  className="hover:bg-red-50 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Weather Bar */}
      {weatherData && (
        <WeatherBar data={weatherData} destination={destination} />
      )}

      {/* Section Header Strip */}
      <div style={{ background: '#0d1f2e', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0a4a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Calendar style={{ width: '18px', height: '18px', color: '#2dd4bf' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Day-by-Day Itinerary</p>
          <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '2px' }}>{days.length} days planned with {totalPlaces} places to visit</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: '#0a1a2e', paddingLeft: '22px', paddingRight: '22px', paddingTop: '20px', paddingBottom: '20px' }}>
        {days.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '64px', paddingBottom: '64px', background: '#0d2b3e', borderRadius: '16px', border: '1px solid rgba(45,212,191,0.2)', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            <Compass style={{ width: '40px', height: '40px', margin: '0 auto 12px', color: '#2dd4bf' }} />
            <p style={{ color: '#cbd5e1', fontWeight: 500 }}>No day data available</p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>This itinerary doesn't have detailed day plans yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {days.map((day: any, idx: number) => (
              <div key={idx}>
                {idx >= 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    style={{
                      textAlign: 'center',
                      padding: '16px',
                      marginBottom: '12px',
                      margin: '0 auto 12px auto',
                      maxWidth: '400px',
                      background: 'linear-gradient(135deg, #0f2d44 0%, #0d2b3e 100%)',
                      borderRadius: '12px',
                      border: '2px solid rgba(45,212,191,0.3)',
                    }}
                  >
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      Day {idx + 1}
                    </p>
                  </motion.div>
                )}
                <motion.div
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
              </div>
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
          style={{ marginTop: '40px', display: 'flex', gap: '10px', paddingBottom: '20px' }}
        >
          <button
            onClick={() => window.print()}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '12px', background: '#0d2b3e', border: '1px solid rgba(45,212,191,0.3)', color: '#2dd4bf', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            className="hover:opacity-80 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export / Print
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              showToast('Link copied to clipboard!', 'success')
            }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '12px', background: 'linear-gradient(135deg, #0a4a4a, #0d2b3e)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            className="hover:opacity-90 transition-opacity"
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
