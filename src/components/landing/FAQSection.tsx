'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const faqs = [
  {
    question: 'How can I plan my trip using TripVerse?',
    answer: 'TripVerse makes trip planning easy! Simply search for flights, hotels, or car rentals using our intuitive search bar. You can compare prices, read reviews, and book everything in one place. Plus, our monument recognition feature helps you discover historical sites during your travels.'
  },
  {
    question: 'Can I book flights and hotels here?',
    answer: 'Yes! TripVerse is your one-stop platform for all travel bookings. You can search and book flights, reserve hotels, and rent cars directly through our platform. We partner with trusted providers to ensure you get the best deals and secure bookings.'
  },
  {
    question: 'What is the monument recognition feature?',
    answer: 'Our innovative monument recognition feature uses AI technology to identify historical monuments and landmarks from photos. Simply upload an image, and we\'ll provide you with detailed information about the monument, including its history, architectural style, and significance. It\'s perfect for curious travelers!'
  },
  {
    question: 'Is TripVerse free to use?',
    answer: 'Creating an account and browsing TripVerse is completely free! We only charge standard booking fees when you make a reservation for flights, hotels, or car rentals. There are no hidden costs, and you\'ll always see the total price before confirming your booking.'
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-primary transition-transform flex-shrink-0 ${
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
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">
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

