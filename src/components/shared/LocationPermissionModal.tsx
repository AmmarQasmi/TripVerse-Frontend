'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LocationPermissionModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
  onClose: () => void
}

export function LocationPermissionModal({
  isOpen,
  onAccept,
  onDecline,
  onClose,
}: LocationPermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Enable Location</h2>
                    <p className="text-cyan-100 text-sm">Get weather for your area</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  TripVerse would like to access your location to show you accurate weather
                  information for your current area.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Why we need this:</strong>
                    <br />
                    • Real-time weather for your location
                    <br />
                    • Better travel recommendations
                    <br />• Personalized local content
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={onDecline}
                    variant="outline"
                    className="flex-1"
                  >
                    Use Default
                  </Button>
                  <Button
                    onClick={onAccept}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    Allow Location
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Your location data is only used for weather and never stored
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
