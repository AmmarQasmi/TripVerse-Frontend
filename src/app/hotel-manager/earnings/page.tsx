'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faChartLine, faBuilding } from '@fortawesome/free-solid-svg-icons'

export default function HotelManagerEarningsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Earnings & Analytics"
        subtitle="View your earnings and performance analytics"
        backUrl="/hotel-manager/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 mb-6">
                    <FontAwesomeIcon 
                      icon={faChartLine} 
                      className="text-4xl text-white"
                    />
                  </div>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                >
                  Coming Soon
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-lg text-gray-600 mb-2"
                >
                  The Earnings & Analytics feature will be implemented in
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="inline-block"
                >
                  <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    FYP 2
                  </span>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-gray-500 mt-8 mb-8 max-w-md mx-auto"
                >
                  This feature will include detailed earnings breakdowns, analytics, and performance metrics for your hotels.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Link href="/hotel-manager/dashboard">
                    <Button
                      className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                      Return to Dashboard
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
