'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateReview } from '@/features/hotels/useHotelSearch'

// SVG Icons
const StarFilledIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const StarEmptyIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const XIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const CheckCircleIcon = ({ className = 'w-12 h-12' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

interface ReviewFormModalProps {
  hotelId: string
  hotelName: string
  isOpen: boolean
  onClose: () => void
}

export function ReviewFormModal({ hotelId, hotelName, isOpen, onClose }: ReviewFormModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createReview = useCreateReview(hotelId)
  const maxLength = 1000

  const handleSubmit = async () => {
    if (rating === 0) return
    setSubmitError(null)

    try {
      await createReview.mutateAsync({
        rating,
        comment: comment.trim() || undefined,
      })
      setShowSuccess(true)
      // Auto-close after showing success
      setTimeout(() => {
        setShowSuccess(false)
        setRating(0)
        setComment('')
        onClose()
      }, 2000)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit review. Please try again.'
      setSubmitError(typeof msg === 'string' ? msg : msg[0] || 'Failed to submit review.')
    }
  }

  const displayRating = hoverRating || rating

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Success State */}
          {showSuccess ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              >
                <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-gray-400">Your review has been submitted successfully.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h3 className="text-xl font-bold text-white">Write a Review</h3>
                  <p className="text-gray-400 text-sm mt-1">{hotelName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                >
                  <XIcon />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Your Rating <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform duration-100 hover:scale-110 focus:outline-none"
                      >
                        {star <= displayRating ? (
                          <StarFilledIcon className="w-10 h-10 text-yellow-400 drop-shadow-sm" />
                        ) : (
                          <StarEmptyIcon className="w-10 h-10 text-gray-600 hover:text-gray-500" />
                        )}
                      </button>
                    ))}
                    {displayRating > 0 && (
                      <span className="ml-3 text-sm font-medium text-gray-300">
                        {ratingLabels[displayRating]}
                      </span>
                    )}
                  </div>
                  {rating === 0 && submitError && (
                    <p className="text-red-400 text-xs mt-1">Please select a rating</p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Review <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      if (e.target.value.length <= maxLength) {
                        setComment(e.target.value)
                      }
                    }}
                    placeholder="Share your experience with other travelers..."
                    rows={5}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none transition-all"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      Share details about your stay — rooms, service, amenities
                    </span>
                    <span className={`text-xs ${comment.length > maxLength * 0.9 ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {comment.length}/{maxLength}
                    </span>
                  </div>
                </div>

                {/* Error */}
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {submitError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700/50">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || createReview.isPending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {createReview.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
