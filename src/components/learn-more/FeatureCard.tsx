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
      whileHover={{
        scale: 1.03,
        boxShadow: '0 14px 28px rgba(0,0,0,0.35)',
      }}
      className="group relative"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      <div
        className="relative h-full overflow-hidden rounded-2xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
        style={{
          background: 'linear-gradient(135deg, #1d4ed8, #155e75, #115e59)',
        }}
      >
        <div className="relative overflow-hidden rounded-t-xl rounded-b-lg">
          <img
            src={image}
            alt={imageAlt}
            className="h-36 w-full object-cover sm:h-40 md:h-44 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="mt-4 flex h-[calc(100%-11rem)] flex-col text-center md:text-left">
          <h3 className="text-lg font-semibold text-white md:text-xl">{title}</h3>
          <p
            className="mt-2 text-sm leading-[1.4] text-gray-300"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>

          {ctaLabel && redirectLink ? (
            <div className="mt-auto flex justify-center pt-4 md:justify-end">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href={redirectLink}
                  className="inline-flex rounded-full bg-[#3b82f6] px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#0891b2] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {ctaLabel}
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="mt-auto pt-4" />
          )}
        </div>
      </div>
    </motion.article>
  )
}
