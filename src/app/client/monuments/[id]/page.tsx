'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { monumentsApi } from '@/lib/api/monuments.api'
import { LandingHeader } from '@/components/landing/LandingHeader'

export default function MonumentResultPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [monument, setMonument] = useState<any>(null)
  const [reviews, setReviews] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [pollingReviews, setPollingReviews] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null)
  const [showRawJson, setShowRawJson] = useState(false)
  const [copied, setCopied] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (id) {
      loadMonument()
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [id])

  useEffect(() => {
    if (monument) {
      loadReviews()
    }
  }, [monument])

  const loadMonument = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await monumentsApi.getById(id)
      setMonument(data)
    } catch (err: any) {
      console.error('Failed to load monument:', err)
      setError(err?.response?.data?.message || 'Failed to load monument details')
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      setLoadingReviews(true)
      const data = await monumentsApi.getReviews(id)
      setReviews(data)

      if (data.status === 'pending' && !pollingReviews) {
        startPolling()
      }
    } catch (err: any) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const startPolling = () => {
    if (pollingReviews || pollIntervalRef.current) return
    setPollingReviews(true)
    setPollCount(0)

    let pollDelay = 5000 // Start with 5 seconds
    let requestCount = 0

    const poll = async () => {
      try {
        requestCount++
        setPollCount(requestCount)
        const data = await monumentsApi.getReviews(id)
        setReviews(data)

        if (data.status === 'completed' || data.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          setPollingReviews(false)
          return
        }

        // Exponential backoff after 6 requests
        if (requestCount >= 6) {
          pollDelay = Math.min(pollDelay * 1.5, 20000) // Max 20 seconds
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }

    // Initial poll
    poll()

    // Set up interval with dynamic delay
    pollIntervalRef.current = setInterval(() => {
      poll()
    }, pollDelay)

    // Stop after 2 minutes
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      setPollingReviews(false)
    }, 120000)
  }

  const handleExport = async (format: 'pdf' | 'docx') => {
    setIsExporting(true)
    setExportDownloadUrl(null)
    try {
      const result = format === 'pdf' 
        ? await monumentsApi.exportPDF(id)
        : await monumentsApi.exportDOCX(id)
      
      const downloadUrl = result.data?.downloadUrl
      
      if (downloadUrl) {
        setExportDownloadUrl(downloadUrl)
        // Auto-download
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${monument.name}-${format}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error('No download URL received')
      }
    } catch (err: any) {
      console.error('Export failed:', err)
      alert(err?.response?.data?.message || err?.message || 'Failed to export monument information')
    } finally {
      setIsExporting(false)
      if (exportDownloadUrl) {
        setTimeout(() => setShowExportModal(false), 2000)
      }
    }
  }

  const copyCoordinates = () => {
    if (monument?.coordinates) {
      const coords = `${monument.coordinates.lat}, ${monument.coordinates.lng}`
      navigator.clipboard.writeText(coords)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openInMaps = () => {
    if (monument?.coordinates) {
      const url = `https://www.google.com/maps?q=${monument.coordinates.lat},${monument.coordinates.lng}`
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-700 via-cyan-700 to-teal-700">
        <LandingHeader />
        <div className="container mx-auto px-4 py-8 pt-24 max-w-[1200px]">
          <div className="space-y-6 animate-pulse">
            <div className="h-12 bg-white/20 backdrop-blur-lg rounded-xl w-1/3"></div>
            <div className="h-96 bg-white/10 backdrop-blur-lg rounded-2xl"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl"></div>
              <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl"></div>
              <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !monument) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-700 via-cyan-700 to-teal-700">
        <LandingHeader />
        <div className="container mx-auto px-4 py-8 pt-24 max-w-[1200px]">
          <div className="backdrop-blur-lg bg-white/20 rounded-2xl p-8 border border-red-300 text-center">
            <p className="text-lg text-red-600 mb-4">{error || 'Monument not found'}</p>
            <Link href="/client/monuments">
              <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
                Back to Monuments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-700 via-cyan-700 to-teal-700">
      {/* Background with parallax */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(29,78,216,0.24), rgba(8,145,178,0.18), rgba(13,148,136,0.18))'
          }}
        />
      </div>

      <LandingHeader />
      
      <div className="container mx-auto px-4 md:px-6 py-8 pt-24 max-w-[1200px] relative z-10">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/client/monuments">
            <Button
              variant="outline"
              className="backdrop-blur-sm bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              ← Back to Monuments
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Image & Hero (4 cols) */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Image with Overlay */}
              <div className="relative rounded-2xl overflow-hidden backdrop-blur-lg bg-white/10 border border-white/30 shadow-2xl">
                <img
                  src={monument.imageUrl}
                  alt={monument.name}
                  className="w-full h-80 object-cover"
                />
                {/* Confidence Badge */}
                <div className="absolute top-4 left-4 backdrop-blur-md bg-white/90 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(monument.confidence * 100)}% Confidence
                  </span>
                </div>
                {/* Action Icons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => navigator.share?.({ title: monument.name, url: window.location.href })}
                    className="backdrop-blur-md bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                    aria-label="Share"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <a
                    href={monument.imageUrl}
                    download
                    className="backdrop-blur-md bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                    aria-label="Download original"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Coordinates Card */}
              {monument.coordinates && (
                <div className="backdrop-blur-lg bg-white/18 rounded-xl p-4 border border-cyan-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">📍 Location</span>
                    <button
                      onClick={copyCoordinates}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 font-mono mb-3">
                    {monument.coordinates.lat.toFixed(6)}, {monument.coordinates.lng.toFixed(6)}
                  </p>
                  <Button
                    onClick={openInMaps}
                    className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 text-white text-sm"
                  >
                    Open in Maps 🗺️
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Center Column - Core Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-lg bg-white/18 rounded-2xl p-6 border border-cyan-400/30 shadow-xl"
            >
              {/* Title & Rating */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-2">{monument.name}</h1>
                  {monument.placeDetails?.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {monument.placeDetails.rating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < Math.round(monument.placeDetails.rating) ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      {monument.placeDetails.user_ratings_total && (
                        <span className="text-sm text-gray-600">
                          ({monument.placeDetails.user_ratings_total} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Recognition Confidence</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(monument.confidence * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(monument.confidence * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full"
                  />
                </div>
              </div>

              {/* Wikipedia Snippet */}
              {monument.wikiSnippet && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📖</span>
                    About
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">{monument.wikiSnippet}</p>
                  {monument.wikipediaUrl && (
                    <a
                      href={monument.wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:text-cyan-700 text-sm font-medium inline-flex items-center gap-1"
                    >
                      Read full article on Wikipedia →
                    </a>
                  )}
                </div>
              )}

              {/* Place Details */}
              {monument.placeDetails && (
                <div className="space-y-3 pt-4 border-t border-white/20">
                  {monument.placeDetails.formatted_address && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">📍 Address</span>
                      <p className="text-sm text-gray-900">{monument.placeDetails.formatted_address}</p>
                    </div>
                  )}
                  {monument.placeDetails.international_phone_number && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">📞 Phone</span>
                      <p className="text-sm text-gray-900">{monument.placeDetails.international_phone_number}</p>
                    </div>
                  )}
                  {monument.placeDetails.website && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">🌐 Website</span>
                      <a
                        href={monument.placeDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-600 hover:text-cyan-700 block truncate"
                      >
                        {monument.placeDetails.website}
                      </a>
                    </div>
                  )}
                  {monument.placeDetails.opening_hours && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">🕐 Hours</span>
                      <div className="text-sm text-gray-900">
                        {monument.placeDetails.opening_hours.open_now ? (
                          <span className="text-green-600 font-medium">Open Now</span>
                        ) : (
                          <span className="text-red-600 font-medium">Closed</span>
                        )}
                        {monument.placeDetails.opening_hours.weekday_text && (
                          <div className="mt-2 space-y-1">
                            {monument.placeDetails.opening_hours.weekday_text.slice(0, 3).map((day: string, i: number) => (
                              <p key={i} className="text-xs text-gray-600">{day}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Map Block */}
              {monument.coordinates && (
                <div className="mt-6 rounded-xl overflow-hidden border border-white/30">
                  <div
                    className="w-full h-48 bg-gray-200 relative"
                    style={{
                      backgroundImage: `url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+0891b2(${monument.coordinates.lng},${monument.coordinates.lat})/${monument.coordinates.lng},${monument.coordinates.lat},14,0/400x300?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="p-4 backdrop-blur-sm bg-white/10">
                    <Button
                      onClick={openInMaps}
                      className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 text-white"
                    >
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Reviews Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-lg bg-white/18 rounded-2xl p-6 border border-cyan-400/30 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>⭐</span>
                Reviews & Ratings
              </h3>

              {loadingReviews || (reviews?.status === 'pending' && pollingReviews) ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-700 mb-2">Fetching reviews from Google Places...</p>
                  {pollingReviews && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Request #{pollCount}</p>
                      <p className="text-cyan-600">This can take up to 2 minutes</p>
                    </div>
                  )}
                </div>
              ) : reviews?.status === 'failed' ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Failed to load reviews</p>
                  <Button
                    variant="outline"
                    onClick={loadReviews}
                    className="bg-white/20 border-white/30 text-gray-900"
                  >
                    Retry
                  </Button>
                </div>
              ) : reviews?.status === 'not_started' ? (
                <div className="text-center py-8 text-gray-600">
                  <p>Reviews not available for this monument</p>
                </div>
              ) : reviews?.status === 'completed' && reviews.reviews ? (
                <div className="space-y-4">
                  {reviews.rating && (
                    <div className="flex items-center justify-between pb-4 border-b border-white/20">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{reviews.rating.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">
                          {reviews.user_ratings_total || reviews.reviews.length} reviews
                        </div>
                      </div>
                      {reviews.formatted_address && (
                        <p className="text-sm text-gray-600 text-right max-w-[200px]">
                          {reviews.formatted_address}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {reviews.reviews.map((review: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="pb-4 border-b border-white/10 last:border-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.author_name}</p>
                            {review.relative_time_description && (
                              <p className="text-xs text-gray-500">{review.relative_time_description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>No reviews available yet</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Tools (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Export Card */}
              <div className="backdrop-blur-lg bg-white/18 rounded-xl p-6 border border-cyan-400/30 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📥</span>
                  Export
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setExportFormat('pdf')
                      setShowExportModal(true)
                    }}
                    className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 text-white h-12"
                  >
                    Export as PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setExportFormat('docx')
                      setShowExportModal(true)
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white h-12"
                  >
                    Export as DOCX
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="backdrop-blur-lg bg-white/18 rounded-xl p-6 border border-cyan-400/30 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>ℹ️</span>
                  Quick Info
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Recognized:</span>
                    <p className="text-gray-900 mt-1">
                      {new Date(monument.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {reviews?.rating && (
                    <div>
                      <span className="text-gray-600 font-medium">Average Rating:</span>
                      <p className="text-gray-900 mt-1">{reviews.rating.toFixed(1)} / 5.0</p>
                    </div>
                  )}
                  {reviews?.user_ratings_total && (
                    <div>
                      <span className="text-gray-600 font-medium">Total Reviews:</span>
                      <p className="text-gray-900 mt-1">{reviews.user_ratings_total}</p>
                    </div>
                  )}
                  {monument.placeDetails?.place_id && (
                    <div>
                      <span className="text-gray-600 font-medium">Place ID:</span>
                      <p className="text-gray-900 mt-1 font-mono text-xs break-all">
                        {monument.placeDetails.place_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw JSON Panel */}
              {monument.rawData && (
                <div className="backdrop-blur-lg bg-white/18 rounded-xl p-6 border border-cyan-400/30 shadow-xl">
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="w-full text-left flex items-center justify-between text-sm font-semibold text-gray-900"
                  >
                    <span className="flex items-center gap-2">
                      <span>🔧</span>
                      Raw JSON Data
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${showRawJson ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {showRawJson && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                          {JSON.stringify(monument.rawData, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isExporting && setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-lg bg-white/20 rounded-2xl p-6 border border-cyan-400/50 shadow-2xl max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Export Monument</h3>
              
              {!isExporting && !exportDownloadUrl && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                      />
                      Include Wikipedia snippet
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleExport(exportFormat)}
                      className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-600 text-white"
                    >
                      Export as {exportFormat.toUpperCase()}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowExportModal(false)}
                      className="bg-white/20 border-white/30"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isExporting && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-700">Preparing export...</p>
                </div>
              )}

              {exportDownloadUrl && (
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium mb-4">Export ready!</p>
                  <a
                    href={exportDownloadUrl}
                    download
                    className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
                  >
                    Download {exportFormat.toUpperCase()}
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
