'use client'

import { motion } from 'framer-motion'
import { Shield, Globe, Plane, Lock, CheckCircle, Zap } from 'lucide-react'

export function TrustSection() {
  const trustFeatures = [
    {
      icon: Lock,
      title: 'Secure Stripe Payments',
      description: 'All transactions are encrypted and processed through Stripe\'s secure payment gateway. Your financial information is protected with bank-level security.',
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      icon: Globe,
      title: 'Verified Airline APIs',
      description: 'We partner with verified airlines and use official APIs to ensure real-time availability and accurate pricing for all flight bookings.',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      icon: Plane,
      title: 'Real-Time Availability',
      description: 'Get instant confirmation on flight availability with live updates from airline systems. No more booking disappointments or last-minute changes.',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    }
  ]

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Best Price Guarantee',
      description: 'We guarantee the best prices or we\'ll match any lower price you find elsewhere.',
      color: 'text-green-400'
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Book your flights instantly with immediate confirmation and e-ticket delivery.',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you with any booking or travel needs.',
      color: 'text-cyan-400'
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900/70 to-blue-900/30 backdrop-blur-md">
      <div className="container mx-auto">
        {/* Main Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Why Book With Us?
          </h2>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
            Discover the unbeatable benefits and exclusive advantages of booking directly with us—where your satisfaction is our top priority.
          </p>
        </motion.div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all group">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-cyan-700/40"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Additional Benefits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0">
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-cyan-300 mb-2">500K+</div>
              <div className="text-gray-300">Happy Travelers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-300 mb-2">50+</div>
              <div className="text-gray-300">Partner Airlines</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-300 mb-2">100+</div>
              <div className="text-gray-300">Destinations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-300 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
