'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string
  documentName?: string
}

export function DocumentViewer({ isOpen, onClose, documentUrl, documentName }: DocumentViewerProps) {
  const isPdf = documentUrl.toLowerCase().endsWith('.pdf') || documentUrl.includes('application/pdf')
  const isImage = !isPdf

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {documentName || 'Document Viewer'}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                {isPdf ? (
                  <iframe
                    src={documentUrl}
                    className="w-full h-full min-h-[600px] rounded-lg border border-gray-200"
                    title={documentName || 'Document'}
                  />
                ) : (
                  <div className="flex items-center justify-center">
                    <img
                      src={documentUrl}
                      alt={documentName || 'Document'}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <a
                  href={documentUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Document
                </a>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

