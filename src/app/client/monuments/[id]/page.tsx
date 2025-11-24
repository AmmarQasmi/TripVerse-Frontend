'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadMonument()
    }
  }, [id])

  useEffect(() => {
    if (monument && !reviews) {
      loadReviews()
      // Start polling if status is pending
      if (reviews?.status === 'pending') {
        startPolling()
      }
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

      // If still pending, start polling
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
    if (pollingReviews) return
    setPollingReviews(true)

    const pollInterval = setInterval(async () => {
      try {
        const data = await monumentsApi.getReviews(id)
        setReviews(data)

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollInterval)
          setPollingReviews(false)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      setPollingReviews(false)
    }, 120000)
  }

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      const response = await monumentsApi.export(id, format as 'pdf' | 'html' | 'json' | 'docx')
      const url = window.URL.createObjectURL(response)
      const a = document.createElement('a')
      a.href = url
      a.download = `${monument.name}-${format}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export monument information')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !monument) {
    return (
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <div className="container mx-auto px-4 py-8 pt-24">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p className="text-lg mb-2">{error || 'Monument not found'}</p>
                <Link href="/client/monuments">
                  <Button variant="outline">Back to Monuments</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <Link href="/client/monuments">
            <Button variant="outline" className="mb-4">
              ← Back to Monuments
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card>
              <CardContent className="p-0">
                <img
                  src={monument.imageUrl}
                  alt={monument.name}
                  className="w-full h-96 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{monument.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.round(monument.confidence * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(monument.confidence * 100)}%
                    </span>
                  </div>

                  {monument.wikiSnippet && (
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-gray-600">{monument.wikiSnippet}</p>
                      {monument.wikipediaUrl && (
                        <a
                          href={monument.wikipediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                        >
                          Read more on Wikipedia →
                        </a>
                      )}
                    </div>
                  )}

                  {monument.coordinates && (
                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <p className="text-gray-600">
                        Latitude: {monument.coordinates.lat.toFixed(6)}, Longitude:{' '}
                        {monument.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReviews || (reviews?.status === 'pending' && pollingReviews) ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500">Fetching reviews...</p>
                  </div>
                ) : reviews?.status === 'failed' ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Failed to load reviews. Please try again later.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={loadReviews}
                    >
                      Retry
                    </Button>
                  </div>
                ) : reviews?.status === 'not_started' ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Reviews not available for this monument.</p>
                  </div>
                ) : reviews?.status === 'completed' && reviews.reviews ? (
                  <div className="space-y-4">
                    {reviews.rating && (
                      <div className="flex items-center space-x-4 pb-4 border-b">
                        <div>
                          <div className="text-3xl font-bold">{reviews.rating.toFixed(1)}</div>
                          <div className="text-sm text-gray-500">
                            {reviews.user_ratings_total || reviews.reviews.length} reviews
                          </div>
                        </div>
                        {reviews.formatted_address && (
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{reviews.formatted_address}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {reviews.reviews.map((review: any, index: number) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{review.author_name}</p>
                              {review.relative_time_description && (
                                <p className="text-xs text-gray-500">
                                  {review.relative_time_description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
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
                          <p className="text-gray-700 text-sm">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reviews available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => handleExport('pdf')}
                >
                  Export as PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport('docx')}
                >
                  Export as DOCX
                </Button>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Recognized:</span>
                  <p className="text-gray-900">
                    {new Date(monument.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {reviews?.rating && (
                  <div>
                    <span className="font-medium text-gray-500">Average Rating:</span>
                    <p className="text-gray-900">{reviews.rating.toFixed(1)} / 5.0</p>
                  </div>
                )}
                {reviews?.user_ratings_total && (
                  <div>
                    <span className="font-medium text-gray-500">Total Reviews:</span>
                    <p className="text-gray-900">{reviews.user_ratings_total}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

