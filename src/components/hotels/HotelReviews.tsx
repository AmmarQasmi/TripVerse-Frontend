'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotelReviews, useCanReview } from '@/features/hotels/useHotelSearch'
import { useAuth } from '@/features/auth/useAuth'

// SVG Icons
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

const VerifiedIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
)

const PencilIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
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

interface HotelReviewsProps {
  hotelId: string
  onWriteReview?: () => void
}

export function HotelReviews({ hotelId, onWriteReview }: HotelReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const limit = 10

  const { user } = useAuth()
  const { data: reviewsData, isLoading, error } = useHotelReviews(hotelId, currentPage, limit)
  const { data: canReviewData } = useCanReview(hotelId, !!user)

  const reviews = reviewsData?.reviews || []
  const avgRating = reviewsData?.avg_rating || 0
  const total = reviewsData?.total || 0
  const pagination = reviewsData?.pagination || { page: 1, limit: 10, pages: 1 }

  const renderStars = (rating: number, size: string = 'w-5 h-5') => {
    return Array.from({ length: 5 }).map((_, i) => (
      i < rating
        ? <StarFilledIcon key={i} className={`${size} text-yellow-400`} />
        : <StarEmptyIcon key={i} className={`${size} text-gray-600`} />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach((review: any) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++
      }
    })
    return distribution
  }

  const filteredReviews = filterRating
    ? reviews.filter((r: any) => r.rating === filterRating)
    : reviews

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(r => (
              <div key={r} className="flex items-center space-x-3">
                <div className="w-8 h-4 bg-gray-700 rounded" />
                <div className="flex-1 h-2 bg-gray-700 rounded-full" />
                <div className="w-8 h-4 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-700 rounded w-1/6" />
                <div className="h-4 bg-gray-700 rounded w-full mt-2" />
                <div className="h-4 bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <h3 className="text-lg font-semibold text-white mb-1">Failed to load reviews</h3>
        <p className="text-gray-400 text-sm">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Guest Reviews</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</span>
                <div className="flex">{renderStars(Math.round(avgRating))}</div>
              </div>
              <span className="text-gray-400">
                Based on {total} review{total !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {canReviewData?.can_review && onWriteReview && (
            <button
              onClick={onWriteReview}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-150"
            >
              <PencilIcon className="w-4 h-4" />
              Write a Review
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        {total > 0 && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = getRatingDistribution()[rating - 1]
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              
              return (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`flex items-center space-x-3 w-full group transition-all duration-75 rounded-lg px-2 py-0.5 ${
                    filterRating === rating ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
                  }`}
                >
                  <span className="text-gray-300 w-8 text-sm flex items-center gap-1">
                    {rating}
                    <StarFilledIcon className="w-3.5 h-3.5 text-yellow-400" />
                  </span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] h-2 rounded-full transition-all duration-75"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-8">{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {filterRating && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-gray-400 text-sm">Showing:</span>
            <button
              onClick={() => setFilterRating(null)}
              className="flex items-center gap-1 bg-cyan-600/20 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-600/30 hover:bg-cyan-600/30 transition-all"
            >
              {filterRating} star{filterRating > 1 ? 's' : ''}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* No Reviews State */}
      {total === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-1">No reviews yet</h3>
          <p className="text-gray-400 text-sm mb-4">Be the first to share your experience!</p>
          {canReviewData?.can_review && onWriteReview && (
            <button
              onClick={onWriteReview}
              className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review: any, index: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    {review.user?.profile_picture ? (
                      <img
                        src={review.user.profile_picture}
                        alt={review.user?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {getInitials(review.user?.name || 'Anonymous')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">
                            {review.user?.name || 'Anonymous'}
                          </h4>
                          {review.verified_stay && (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
                              <VerifiedIcon className="w-3.5 h-3.5" />
                              Verified Stay
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">{renderStars(review.rating, 'w-4 h-4')}</div>
                          <span className="text-gray-400 text-sm">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
            .map((page, idx, arr) => {
              const showEllipsis = idx > 0 && page - arr[idx - 1] > 1
              return (
                <div key={page} className="flex items-center gap-2">
                  {showEllipsis && <span className="text-gray-500 px-1">...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                        : 'bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:bg-gray-700/60'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              )
            })}

          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
            disabled={currentPage === pagination.pages}
            className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
