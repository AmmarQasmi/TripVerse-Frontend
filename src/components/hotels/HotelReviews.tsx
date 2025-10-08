'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface HotelReviewsProps {
  hotelId: string
}

interface Review {
  id: string
  userName: string
  userAvatar: string
  rating: number
  date: string
  comment: string
  helpful: number
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    rating: 5,
    date: '2024-01-10',
    comment: 'Absolutely amazing stay! The hotel exceeded all our expectations. The staff was incredibly friendly and helpful, and the room was spotless with a beautiful view.',
    helpful: 12
  },
  {
    id: '2',
    userName: 'Michael Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 4,
    date: '2024-01-08',
    comment: 'Great location and excellent amenities. The pool area was fantastic and the breakfast had a good variety. Would definitely recommend!',
    helpful: 8
  },
  {
    id: '3',
    userName: 'Emma Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5,
    date: '2024-01-05',
    comment: 'Perfect for our anniversary trip! The spa services were outstanding and the room service was prompt. Will be coming back next year.',
    helpful: 15
  },
  {
    id: '4',
    userName: 'David Kim',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    rating: 4,
    date: '2024-01-03',
    comment: 'Very comfortable stay with modern facilities. The only minor issue was the WiFi speed in our room, but everything else was perfect.',
    helpful: 6
  },
  {
    id: '5',
    userName: 'Lisa Thompson',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    rating: 5,
    date: '2024-01-01',
    comment: 'Exceptional service from check-in to check-out. The concierge helped us plan our entire day and the hotel restaurant was outstanding.',
    helpful: 9
  }
]

export function HotelReviews({ hotelId }: HotelReviewsProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'helpful'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
        ★
      </span>
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAverageRating = () => {
    const total = mockReviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / mockReviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    mockReviews.forEach(review => {
      distribution[review.rating - 1]++
    })
    return distribution
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
                <span className="text-3xl font-bold text-white">{getAverageRating()}</span>
                <div className="flex">{renderStars(Math.round(parseFloat(getAverageRating())))}</div>
              </div>
              <span className="text-gray-400">
                Based on {mockReviews.length} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating, index) => {
            const count = getRatingDistribution()[index]
            const percentage = (count / mockReviews.length) * 100
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-gray-300 w-8">{rating}★</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm w-8">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-300 font-medium">Filter by rating:</span>
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {mockReviews
          .filter(review => !filterRating || review.rating === filterRating)
          .map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{review.userName}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-gray-400 text-sm">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <button className="flex items-center space-x-1 hover:text-white transition-colors">
                      <span>👍</span>
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="hover:text-white transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Load More Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
          Load More Reviews
        </button>
      </div>
    </div>
  )
}
