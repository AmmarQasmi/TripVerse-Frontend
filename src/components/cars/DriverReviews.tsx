'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDriverReviews } from '@/features/bookings/useCarBooking'

const StarFilledIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const StarEmptyIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const ChevronLeftIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRightIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

interface DriverReviewsProps {
  driverId: string
}

export function DriverReviews({ driverId }: DriverReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useDriverReviews(driverId, currentPage, limit)
  const reviewsData = data as {
    reviews: Array<{ id: number; rating: number; comment?: string; created_at: string; user: { id: number; name: string } }>
    avg_rating: number | null
    total: number
    pagination: { page: number; limit: number; pages: number }
  } | undefined

  const reviews = reviewsData?.reviews || []
  const avgRating = reviewsData?.avg_rating || 0
  const total = reviewsData?.total || 0
  const pagination = reviewsData?.pagination || { page: 1, limit: 10, pages: 1 }

  const renderStars = (rating: number, size = 'w-5 h-5') =>
    Array.from({ length: 5 }).map((_, i) =>
      i < rating
        ? <StarFilledIcon key={i} className={`${size} text-yellow-400`} />
        : <StarEmptyIcon key={i} className={`${size} text-gray-600`} />
    )

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-10 bg-gray-700 rounded w-1/4" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-1/4" />
              </div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
        <div className="text-5xl mb-3">⭐</div>
        <h3 className="text-lg font-semibold text-white mb-1">No Reviews Yet</h3>
        <p className="text-gray-400 text-sm">This driver hasn&apos;t received any passenger reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{avgRating?.toFixed(1) ?? '—'}</div>
            <div className="flex gap-0.5 mt-1 justify-center">
              {renderStars(Math.round(avgRating || 0), 'w-4 h-4')}
            </div>
            <div className="text-gray-400 text-xs mt-1">{total} {total === 1 ? 'review' : 'reviews'}</div>
          </div>
          <div className="flex-1 text-sm text-gray-400">
            Ratings from verified passengers who completed trips with this driver.
          </div>
        </div>
      </div>

      {/* Review Cards */}
      {reviews.map((review) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-semibold text-sm">
                {getInitials(review.user?.name || 'U')}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="font-semibold text-white text-sm">{review.user?.name || 'Passenger'}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDate(review.created_at)}</p>
                </div>
                <div className="flex gap-0.5">
                  {renderStars(review.rating, 'w-4 h-4')}
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">{review.comment}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={currentPage === pagination.pages}
            className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  )
}
