'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

interface Review {
  author?: string
  author_name?: string
  rating?: number
  text?: string
  timeDescription?: string
  relative_time_description?: string
}

interface ReviewCarouselProps {
  reviews: Review[]
}

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [reviews])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = 272 // card width (260) + gap (12)
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    })
  }

  if (reviews.length === 0) return null

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Reviews ({reviews.length})
        </p>
        {reviews.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reviews.map((review, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-[260px] rounded-xl p-3.5 snap-start hover:shadow-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #0f2d44 0%, #0d2b3e 100%)',
              border: '1px solid rgba(45,212,191,0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {(review.author || review.author_name || 'A').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold truncate max-w-[120px]" style={{ color: '#ffffff' }}>
                  {review.author || review.author_name || 'Anonymous'}
                </span>
              </div>
              {review.rating && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating!
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs line-clamp-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {review.text || 'No review text.'}
            </p>
            {(review.timeDescription || review.relative_time_description) && (
              <p className="text-[10px] mt-2" style={{ color: 'rgba(45,212,191,0.7)' }}>
                {review.timeDescription || review.relative_time_description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
