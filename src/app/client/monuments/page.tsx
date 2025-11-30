'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useRecognition } from '@/features/monuments/useRecognition'
import { monumentsApi } from '@/lib/api/monuments.api'
import { LandingHeader } from '@/components/landing/LandingHeader'

type ProcessingStep = 'idle' | 'upload' | 'detection' | 'enrichment' | 'complete'

export default function MonumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle')
  const [recognitions, setRecognitions] = useState<any[]>([])
  const [loadingRecognitions, setLoadingRecognitions] = useState(true)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const { recognizeMonument, isLoading } = useRecognition()

  // Parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 50, stiffness: 100 }
  const x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig)
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig)

  useEffect(() => {
    loadRecognitions()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      mouseX.set((clientX / innerWidth - 0.5) * 2)
      mouseY.set((clientY / innerHeight - 0.5) * 2)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const loadRecognitions = async () => {
    try {
      setLoadingRecognitions(true)
      const data = await monumentsApi.getMyRecognitions(1, 20)
      setRecognitions(data.recognitions || [])
    } catch (error) {
      console.error('Failed to load recognitions:', error)
    } finally {
      setLoadingRecognitions(false)
    }
  }

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
    }
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit. Please choose a smaller image.'
    }
    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        setUploadError(error)
        return
      }
      setUploadError(null)
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRecognize = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    setProcessingStep('upload')
    setUploadError(null)
    
    try {
      // Simulate processing steps
      setTimeout(() => setProcessingStep('detection'), 500)
      setTimeout(() => setProcessingStep('enrichment'), 1500)
      
      const result = await recognizeMonument(selectedFile)
      
      if (result?.id) {
        setProcessingStep('complete')
        // Show confetti for high confidence
        if (result.confidence >= 0.9) {
          // Trigger confetti effect (visual only, no library needed)
        }
        setTimeout(() => {
          router.push(`/client/monuments/${result.id}`)
        }, 500)
      }
    } catch (error: any) {
      console.error('Recognition failed:', error)
      setUploadError(error?.response?.data?.message || 'Failed to recognize monument. Please try again.')
      setIsProcessing(false)
      setProcessingStep('idle')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const error = validateFile(file)
      if (error) {
        setUploadError(error)
        return
      }
      setUploadError(null)
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadError(null)
    setIsProcessing(false)
    setProcessingStep('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getProgressPercentage = () => {
    switch (processingStep) {
      case 'upload': return 33
      case 'detection': return 66
      case 'enrichment': return 90
      case 'complete': return 100
      default: return 0
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        style={{ x, y }}
        className="fixed inset-0 -z-10"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='1920' height='1080' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231d4ed8;stop-opacity:0.24'/%3E%3Cstop offset='50%25' style='stop-color:%230891b2;stop-opacity:0.18'/%3E%3Cstop offset='100%25' style='stop-color:%230d9488;stop-opacity:0.18'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grad)'/%3E%3Cpath d='M0,800 Q400,700 800,750 T1600,800 L1920,800 L1920,1080 L0,1080 Z' fill='%230891b2' opacity='0.1'/%3E%3C/svg%3E")`,
            filter: 'grayscale(60%) blur(1px)',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(29,78,216,0.24), rgba(8,145,178,0.18), rgba(13,148,136,0.18))'
          }}
        />
      </motion.div>

      {/* Floating Clouds */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 100, 0],
            y: [0, -30, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 3
          }}
          className="absolute"
          style={{
            top: `${20 + i * 25}%`,
            left: `${i * 30}%`,
            width: `${150 + i * 50}px`,
            height: `${80 + i * 30}px`,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />
      ))}

      <LandingHeader />
      
      <div className="container mx-auto px-4 md:px-6 py-8 pt-24 max-w-[1200px] relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.span
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-4xl"
            >
              🏛️
            </motion.span>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
              Monument Recognition
            </h1>
          </div>
          <p className="text-base md:text-lg text-gray-700 ml-12">
            Upload a photo of a historical monument to learn about its history and significance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Upload Hero Card - 7 columns */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-lg bg-white/18 rounded-[18px] p-6 md:p-8 border border-cyan-400/30 shadow-2xl"
              style={{
                boxShadow: '0 20px 40px rgba(8, 145, 178, 0.15)'
              }}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📸</span>
                Upload Monument Photo
              </h2>

              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-cyan-400/50 rounded-xl p-12 text-center cursor-pointer transition-all duration-200 hover:border-cyan-500 hover:bg-white/10"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl mb-6"
                  >
                    🏛️
                  </motion.div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop photo here or click to upload
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports JPG, PNG, and WebP formats up to 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {isProcessing ? (
                    <div className="text-center py-8">
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="rgba(8, 145, 178, 0.2)"
                            strokeWidth="8"
                            fill="none"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#0891b2"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - getProgressPercentage() / 100) }}
                            transition={{ duration: 0.5 }}
                          />
                        </svg>
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 flex items-center justify-center text-5xl"
                        >
                          🏛️
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                          <div className={`w-2 h-2 rounded-full ${processingStep === 'upload' ? 'bg-cyan-600' : 'bg-green-500'}`} />
                          <span>Upload</span>
                          <div className={`w-2 h-2 rounded-full ${processingStep === 'detection' ? 'bg-cyan-600' : processingStep === 'enrichment' || processingStep === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span>Landmark Detection</span>
                          <div className={`w-2 h-2 rounded-full ${processingStep === 'enrichment' ? 'bg-cyan-600' : processingStep === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span>Enrichment</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {processingStep === 'upload' && 'Uploading image...'}
                          {processingStep === 'detection' && 'Detecting landmarks...'}
                          {processingStep === 'enrichment' && 'Enriching with Wikipedia & Places data...'}
                          {processingStep === 'complete' && 'Complete! Redirecting...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative rounded-xl overflow-hidden">
                        <img
                          src={previewUrl!}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={resetUpload}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                          aria-label="Remove image"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">File Info</p>
                          <p className="text-xs text-gray-600">{selectedFile.name}</p>
                          <p className="text-xs text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button
                          onClick={handleRecognize}
                          disabled={isLoading}
                          className="w-full h-12 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg"
                        >
                          Recognize Monument
                        </Button>
                        <Button
                          variant="outline"
                          onClick={resetUpload}
                          className="w-full"
                        >
                          Choose Different Photo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                >
                  {uploadError}
                </motion.div>
              )}
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-lg bg-white/18 rounded-[18px] p-6 border border-cyan-400/30 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Tips for Better Recognition
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-cyan-600 mt-0.5">•</span>
                  <span>Take photos in good lighting conditions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-cyan-600 mt-0.5">•</span>
                  <span>Ensure the monument is clearly visible and not obstructed</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-cyan-600 mt-0.5">•</span>
                  <span>Include distinctive architectural features</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-cyan-600 mt-0.5">•</span>
                  <span>Avoid extreme angles or distant shots</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Recognitions - 5 columns */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-lg bg-white/18 rounded-[18px] p-6 border border-cyan-400/30 shadow-xl h-full"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xl">📚</span>
                Recent Recognitions
              </h3>

              {loadingRecognitions ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="backdrop-blur-sm bg-white/10 rounded-xl p-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recognitions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🗺️</div>
                  <p className="text-gray-600 mb-2">No recent recognitions</p>
                  <p className="text-sm text-gray-500">Your recognition history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {recognitions.map((rec) => (
                    <motion.div
                      key={rec.id}
                      whileHover={{ y: -6, transition: { duration: 0.2, ease: [0.2, 0.9, 0.2, 1] } }}
                      className="backdrop-blur-sm bg-white/20 rounded-xl p-4 border border-white/30 hover:border-cyan-400/50 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Link href={`/client/monuments/${rec.id}`}>
                        <div className="flex gap-4">
                          <img
                            src={rec.imageUrl}
                            alt={rec.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1 truncate">{rec.name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full"
                                  style={{ width: `${Math.round(rec.confidence * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                {Math.round(rec.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(rec.createdAt).toLocaleDateString()}
                            </p>
                            {rec.wikiSnippet && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                {rec.wikiSnippet.substring(0, 80)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Footer FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-sm text-gray-600"
        >
          <p>Images are processed securely and not shared publicly. Supported formats: JPEG, PNG, WebP (max 5MB)</p>
        </motion.div>
      </div>
    </div>
  )
}
