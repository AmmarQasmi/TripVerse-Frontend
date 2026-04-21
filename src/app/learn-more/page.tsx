'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FeatureCard } from '@/components/learn-more/FeatureCard'

type LearnMoreFeature = {
  title: string
  description: string
  image: string
  imageAlt: string
  ctaLabel?: string
  redirectLink?: string
}

const features: LearnMoreFeature[] = [
  {
    title: 'Flight Booking',
    description:
      'Compare airlines, prices, and schedules in real time, and book flights instantly from one unified platform.',
    image: '/images/cities/islamabad/islamabad-01.jpg',
    imageAlt: 'Air travel destination view for flight booking',
    ctaLabel: 'Explore',
    redirectLink: '/client/flights',
  },
  {
    title: 'Hotel Booking',
    description:
      'Discover hotels, explore amenities, and reserve rooms with availability tracking.',
    image: '/images/hotels/punjab/pearl-continental-lahore/main.jpg',
    imageAlt: 'Hotel exterior for booking feature',
    ctaLabel: 'Explore',
    redirectLink: '/client/hotels',
  },
  {
    title: 'Car Rental',
    description:
      'Book rental vehicles for convenient travel at your destination with flexible options.',
    image: '/images/cities/karachi/karachi-02.png',
    imageAlt: 'City road scene representing car rental feature',
    ctaLabel: 'Explore',
    redirectLink: '/client/cars',
  },
  {
    title: 'Monument Recognition (AI)',
    description:
      'Upload a landmark image and instantly identify it with rich historical and travel insights.',
    image: '/images/cities/lahore/lahore-03.png',
    imageAlt: 'Historic monument view representing AI recognition feature',
    ctaLabel: 'Try Now',
    redirectLink: '/client/monuments',
  },
  {
    title: 'Weather Insights',
    description:
      'Track live weather forecasts to avoid disruptions and make better trip decisions.',
    image: '/images/cities/peshawar/peshawar-01.png',
    imageAlt: 'Cloudy skyline representing weather insight feature',
  },
  {
    title: 'Trip Itineraries',
    description:
      'Organize destinations, timelines, and booking details in one clear travel plan.',
    image: '/images/cities/faisalabad/faisalabad-01.png',
    imageAlt: 'City destination view representing trip itinerary planning',
  },
  {
    title: 'Real-Time Chat',
    description:
      'Connect quickly through in-app messaging for support and travel coordination.',
    image: '/images/cities/multan/multan-03.png',
    imageAlt: 'Urban communication concept for real-time chat',
  },
  {
    title: 'Notifications System',
    description:
      'Stay updated with instant alerts for bookings, changes, and travel reminders.',
    image: '/images/cities/islamabad/islamabad-02.jpg',
    imageAlt: 'City notification concept for travel alerts',
  },
  {
    title: 'Multi-Role Access',
    description:
      'Role-specific experiences for travelers, drivers, hotel managers, and admins.',
    image: '/images/cities/karachi/karachi-01.png',
    imageAlt: 'Team and platform access concept for multiple user roles',
  },
  {
    title: 'Driver Module',
    description:
      'Enable drivers to manage rides, requests, and availability with ease.',
    image: '/images/cities/peshawar/peshawar-02.png',
    imageAlt: 'Road and transport visual for driver module',
  },
  {
    title: 'Hotel Manager Module',
    description:
      'Tools for hotel-side operations, room inventory, and booking oversight.',
    image: '/images/hotels/sindh/movenpick-karachi/main.jpg',
    imageAlt: 'Hotel management visual for manager module',
  },
  {
    title: 'Payments Foundation',
    description:
      'Secure payment infrastructure that supports reliable booking transactions.',
    image: '/images/cities/lahore/lahore-01.png',
    imageAlt: 'Secure transaction visual for payments foundation',
  },
  {
    title: 'Wallet Support',
    description:
      'Flexible wallet-based options to make checkout faster and easier.',
    image: '/images/cities/faisalabad/faisalabad-02.png',
    imageAlt: 'Digital wallet concept for extended payment support',
  },
  {
    title: 'Dispute Engine',
    description:
      'Structured conflict resolution workflows to build trust and reliability.',
    image: '/images/cities/multan/multan-01.png',
    imageAlt: 'Trust and support visual for dispute handling engine',
  },
  {
    title: 'Admin Dashboard',
    description:
      'Centralized controls to monitor users, operations, and platform health.',
    image: '/images/cities/islamabad/islamabad-03.jpg',
    imageAlt: 'Control center visual for admin dashboard',
  },
]

export default function LearnMorePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <section className="relative flex h-[78vh] items-center justify-center overflow-hidden pt-0">
        <div className="absolute inset-0">
          <div className="grid h-full grid-cols-3">
            <div className="relative h-full">
              <Image
                src="/images/cities/islamabad/islamabad-01.jpg"
                alt="Islamabad view 1"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative h-full">
              <Image
                src="/images/cities/islamabad/islamabad-02.jpg"
                alt="Islamabad view 2"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative h-full">
              <Image
                src="/images/cities/islamabad/islamabad-03.jpg"
                alt="Islamabad view 3"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/80 via-[#0f4c75]/70 to-[#0d9488]/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold leading-tight text-white md:text-6xl"
          >
            Explore What You Can Do
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto mt-5 max-w-3xl text-xl leading-relaxed text-gray-200 md:text-2xl"
          >
            Discover powerful features designed to simplify your travel experience.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="inline-flex rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold text-white">Platform Features</h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              Explore the same trusted experience across flights, hotels, cars, chat, weather, and more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                image={feature.image}
                imageAlt={feature.imageAlt}
                ctaLabel={feature.ctaLabel}
                redirectLink={feature.redirectLink}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
