'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateDriverReview } from '@/features/bookings/useCarBooking'

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

interface DriverReviewModalProps {
  bookingId: string
  driverName: string
  isOpen: boolean
  onClose: () => void
}

export function DriverReviewModal({ bookingId, driverName, isOpen, onClose }: DriverReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createReview = useCreateDriverReview(bookingId)
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
                  <h3 className="text-xl font-bold text-white">Rate Your Driver</h3>
                  <p className="text-gray-400 text-sm mt-1">{driverName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <XIcon />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Star Rating */}
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-3">How was your experience?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        {star <= displayRating ? (
                          <StarFilledIcon className="w-10 h-10 text-yellow-400" />
                        ) : (
                          <StarEmptyIcon className="w-10 h-10 text-gray-500" />
                        )}
                      </button>
                    ))}
                  </div>
                  {displayRating > 0 && (
                    <motion.p
                      key={displayRating}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-yellow-400 font-semibold mt-2"
                    >
                      {ratingLabels[displayRating]}
                    </motion.p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Leave a comment <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, maxLength))}
                    placeholder="Share your experience with this driver..."
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none text-sm"
                  />
                  <p className="text-right text-xs text-gray-500 mt-1">
                    {comment.length}/{maxLength}
                  </p>
                </div>

                {/* Error */}
                {submitError && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || createReview.isPending}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
