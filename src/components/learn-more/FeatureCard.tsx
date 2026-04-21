'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type FeatureCardProps = {
  title: string
  description: string
  image: string
  imageAlt: string
  ctaLabel?: string
  redirectLink?: string
  index: number
}

export function FeatureCard({
  title,
  description,
  image,
  imageAlt,
  ctaLabel,
  redirectLink,
  index,
}: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative h-full"
    >
      <div
        className="relative h-[370px] overflow-hidden rounded-2xl border border-white/10 bg-gray-800/50 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:shadow-xl"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-slate-900/65" />

        <div className="relative aspect-video overflow-hidden rounded-t-xl rounded-b-lg">
          <img
            src={image}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>

        <div className="relative z-10 mt-4 flex h-[calc(100%-12.25rem)] flex-col text-left">
          <div className="relative">
            {ctaLabel && redirectLink ? (
              <motion.div whileTap={{ scale: 0.97 }} className="absolute right-0 top-0 z-10">
                <Link
                  href={redirectLink}
                  className="inline-flex rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300"
                >
                  {ctaLabel}
                </Link>
              </motion.div>
            ) : null}

            <h3
              className="pr-28 text-lg font-semibold text-white md:text-xl"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '3.25rem',
              }}
            >
              {title}
            </h3>
          </div>

          <p
            className="mt-1.5 text-sm leading-[1.4] text-gray-300"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </motion.article>
  )
}
