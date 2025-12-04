'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export function SupportCard() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle feedback submission
    console.log('Feedback submitted:', { email, message })
    setEmail('')
    setMessage('')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Feedback Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ 
          scale: 1.01,
        }}
        className="relative group overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 p-8"
        style={{
          border: '2px solid transparent',
          backgroundImage: `
            linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      >
        {/* Animated Neon Border - TripVerse Theme */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            opacity: 0.9,
            filter: 'blur(1px)',
            zIndex: -1,
            border: '2px solid transparent',
            backgroundClip: 'border-box'
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Outer Glow Effect */}
        <motion.div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            filter: 'blur(3px)',
            opacity: 0.4,
            zIndex: -2
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Corner Highlights */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>
        
        {/* Inner Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mr-3 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Share Your Experience</h3>
              <p className="text-cyan-300 text-sm">We'd love to hear from you</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg backdrop-blur-sm bg-white/20 border border-white/30 text-white placeholder-gray-200 text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-colors"
            />
            <textarea
              placeholder="Tell us what you think..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg backdrop-blur-sm bg-white/20 border border-white/30 text-white placeholder-gray-200 text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-colors resize-none"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-teal-500 via-emerald-500 to-orange-400 text-white font-semibold text-sm shadow-lg hover:from-teal-600 hover:via-emerald-600 hover:to-orange-500 transition-all"
            >
              Send Feedback
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Support Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        whileHover={{ 
          scale: 1.01,
        }}
        className="relative group overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 p-8"
        style={{
          border: '2px solid transparent',
          backgroundImage: `
            linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      >
        {/* Animated Neon Border - TripVerse Theme */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            opacity: 0.9,
            filter: 'blur(1px)',
            zIndex: -1,
            border: '2px solid transparent',
            backgroundClip: 'border-box'
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Outer Glow Effect */}
        <motion.div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
            backgroundSize: '200% 100%',
            filter: 'blur(3px)',
            opacity: 0.4,
            zIndex: -2
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Corner Highlights */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>
        
        {/* Inner Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center mr-3 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Need Help?</h3>
              <p className="text-cyan-300 text-sm">We're here 24/7 for you</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Live Chat */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              className="w-full flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 transition-all group"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Live Chat</p>
                  <p className="text-cyan-300 text-sm">Get instant help</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>

            {/* Email Support */}
            <motion.a
              href="mailto:support@tripverse.com"
              whileHover={{ scale: 1.02, x: 4 }}
              className="w-full flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 transition-all group"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-cyan-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Email Support</p>
                  <p className="text-cyan-300 text-sm">support@tripverse.com</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>

            {/* Help Center */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              className="w-full flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 transition-all group"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-lime-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Help Center</p>
                  <p className="text-cyan-300 text-sm">Browse FAQs & guides</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-lime-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

