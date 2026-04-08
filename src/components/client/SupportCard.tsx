'use client'

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
      <div
        className="relative group overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 opacity-95 shadow-2xl hover:shadow-emerald-400/25 hover:shadow-2xl transition-all duration-75 p-8"
        style={{
          border: '2px solid transparent',
          backgroundImage: `
            linear-gradient(to right, rgb(6, 95, 70), rgb(15, 118, 110), rgb(21, 94, 117)),
            linear-gradient(90deg, #0f766e, #10b981, #0891b2, #0f766e)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      >
        {/* Animated Neon Border - TripVerse Theme */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #0f766e, #10b981, #0891b2, #0f766e)',
            backgroundSize: '200% 100%',
            opacity: 0.9,
            filter: 'blur(1px)',
            zIndex: -1,
            border: '2px solid transparent',
            backgroundClip: 'border-box'
          }}
        />
        
        {/* Outer Glow Effect */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #0f766e, #10b981, #0891b2, #0f766e)',
            backgroundSize: '200% 100%',
            filter: 'blur(3px)',
            opacity: 0.4,
            zIndex: -2
          }}
        />
        
        {/* Corner Highlights */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-emerald-400/30 to-transparent rounded-br-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-teal-400/30 to-transparent rounded-tl-full blur-sm"></div>

        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/images/cities/islamabad/islamabad-03.jpg)' }}
        />

        {/* Readability Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-black/30"></div>
        
        {/* Inner Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-75 rounded-2xl"></div>
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
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold text-sm shadow-lg hover:from-emerald-500 hover:to-teal-600 transition-all"
            >
              Send Feedback
            </button>
          </form>
        </div>
      </div>

      {/* Support Card */}
      <div
        className="relative group overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700 opacity-95 shadow-2xl hover:shadow-blue-400/25 hover:shadow-2xl transition-all duration-75 p-8"
        style={{
          border: '2px solid transparent',
          backgroundImage: `
            linear-gradient(to right, rgb(30, 64, 175), rgb(29, 78, 216), rgb(8, 145, 178)),
            linear-gradient(90deg, #1e3a8a, #2563eb, #0891b2, #1e3a8a)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      >
        {/* Animated Neon Border - TripVerse Theme */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e3a8a, #2563eb, #0891b2, #1e3a8a)',
            backgroundSize: '200% 100%',
            opacity: 0.9,
            filter: 'blur(1px)',
            zIndex: -1,
            border: '2px solid transparent',
            backgroundClip: 'border-box'
          }}
        />
        
        {/* Outer Glow Effect */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1e3a8a, #2563eb, #0891b2, #1e3a8a)',
            backgroundSize: '200% 100%',
            filter: 'blur(3px)',
            opacity: 0.4,
            zIndex: -2
          }}
        />
        
        {/* Corner Highlights */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>

        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/images/cities/karachi/karachi-03.png)' }}
        />

        {/* Readability Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-black/30"></div>
        
        {/* Inner Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-75 rounded-2xl"></div>
        
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
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 transition-all group"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">For Queries Contact us on +1 (234) 567-890</p>
                  <p className="text-cyan-300 text-sm">Get instant help</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Email Support */}
            <a
              href="mailto:support@tripverse.com"
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
            </a>

            {/* Help Center */}
            <button
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
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

