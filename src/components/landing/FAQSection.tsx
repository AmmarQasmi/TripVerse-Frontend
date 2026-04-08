'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const faqs = [
  {
    question: 'How can I plan my trip using TripVerse?',
    answer: 'TripVerse makes trip planning easy! Simply search for flights, hotels, or car rentals using our intuitive search bar. You can compare prices, read reviews, and book everything in one place. Plus, our monument recognition feature helps you discover historical sites during your travels.',
    bgImage: '/images/cities/karachi/karachi-01.png'
  },
  {
    question: 'Can I book flights and hotels here?',
    answer: 'Yes! TripVerse is your one-stop platform for all travel bookings. You can search and book flights, reserve hotels, and rent cars directly through our platform. We partner with trusted providers to ensure you get the best deals and secure bookings.',
    bgImage: '/images/cities/lahore/lahore-02.jpg'
  },
  {
    question: 'What is the monument recognition feature?',
    answer: 'Our innovative monument recognition feature uses AI technology to identify historical monuments and landmarks from photos. Simply upload an image, and we\'ll provide you with detailed information about the monument, including its history, architectural style, and significance. It\'s perfect for curious travelers!',
    bgImage: '/images/cities/multan/multan-01.png'
  },
  {
    question: 'Is TripVerse free to use?',
    answer: 'Creating an account and browsing TripVerse is completely free! We only charge standard booking fees when you make a reservation for flights, hotels, or car rentals. There are no hidden costs, and you\'ll always see the total price before confirming your booking.',
    bgImage: '/images/cities/peshawar/peshawar-02.png'
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          <motion.span
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity 
            }}
            style={{
              background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Frequently Asked Questions
          </motion.span>
        </h2>
        <p className="text-base md:text-lg text-center mb-16 max-w-3xl mx-auto">
          <motion.span
            animate={{ 
              backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'] 
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity 
            }}
            style={{
              background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Get answers to common questions about using TripVerse
          </motion.span>
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 shadow-2xl ${
                openIndex === index
                  ? 'shadow-cyan-400/25'
                  : 'hover:shadow-cyan-400/25'
              }`}
              style={{
                backgroundImage: 'linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175))'
              }}
            >
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  opacity: 0.9,
                  filter: 'blur(1px)',
                  zIndex: -1,
                  backgroundClip: 'padding-box'
                }}
              />
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  filter: 'blur(3px)',
                  opacity: 0.35,
                  zIndex: -2
                }}
              />
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.22] pointer-events-none"
                style={{ backgroundImage: `url(${faq.bgImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/35 to-cyan-900/25 pointer-events-none" />
              <button
                onClick={() => toggleFAQ(index)}
                className={`relative z-10 w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none transition-colors duration-300 ${
                  openIndex === index
                    ? 'bg-gradient-to-r from-blue-900/35 to-cyan-800/30'
                    : 'hover:bg-cyan-500/10'
                }`}
              >
                <span
                  className={`font-semibold pr-4 transition-colors duration-300 ${
                    openIndex === index ? 'text-white' : 'text-white'
                  }`}
                >
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-cyan-200 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div
                className={`transition-all duration-75 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="relative z-10 px-6 pb-4 text-white/90 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

