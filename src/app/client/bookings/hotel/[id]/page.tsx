'use client'

import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useHotelBookingById, useHotelBooking } from '@/features/bookings/useHotelBooking'

type ThemeMode = 'ocean-night' | 'sunset-luxe' | 'emerald-glass'

const THEME_STORAGE_KEY = 'tripverse-booking-details-theme'
const PAGE_BACKGROUND_GRADIENT = 'linear-gradient(135deg, #0E5A84 0%, #0D8D96 100%)'
const CONFIRM_BUTTON_BACKGROUND = '#16A34A'
const CANCEL_BUTTON_BACKGROUND = 'linear-gradient(90deg, #B91C1C 0%, #DC2626 100%)'
const WORLD_MAP_IMAGE = '/images/cities/world%20map.png'
const PAGE_BORDER_COLOR = '#22D3EE'
const PAGE_TEXT_COLOR = '#22D3EE'

const themeTokens: Record<ThemeMode, {
  label: string
  pageGradient: string
  topTint: string
  heroOverlay: string
  accent: string
  secondary: string
  success: string
  danger: string
  cardBg: string
  cardBorder: string
  textPrimary: string
  textMuted: string
  shadow: string
  patternTint: string
}> = {
  'ocean-night': {
    label: 'Ocean Night',
    pageGradient: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 48%, #0D9488 100%)',
    topTint: 'rgba(15, 23, 42, 0.62)',
    heroOverlay: 'linear-gradient(90deg, rgba(30,58,138,0.82) 0%, rgba(15,76,117,0.72) 52%, rgba(20,184,166,0.74) 100%)',
    accent: '#14B8A6',
    secondary: '#1E3A8A',
    success: '#22C55E',
    danger: '#EF4444',
    cardBg: 'rgba(15, 23, 42, 0.54)',
    cardBorder: 'rgba(148, 163, 184, 0.22)',
    textPrimary: '#E2E8F0',
    textMuted: '#94A3B8',
    shadow: '0 12px 40px rgba(8, 47, 73, 0.35)',
    patternTint: 'rgba(56, 189, 248, 0.08)',
  },
  'sunset-luxe': {
    label: 'Sunset Luxe',
    pageGradient: 'linear-gradient(135deg, #312E81 0%, #BE185D 56%, #F97316 100%)',
    topTint: 'rgba(49, 46, 129, 0.58)',
    heroOverlay: 'linear-gradient(90deg, rgba(79,70,229,0.78) 0%, rgba(190,24,93,0.72) 52%, rgba(251,113,133,0.7) 100%)',
    accent: '#FB7185',
    secondary: '#7C3AED',
    success: '#4ADE80',
    danger: '#F87171',
    cardBg: 'rgba(39, 13, 47, 0.5)',
    cardBorder: 'rgba(251, 113, 133, 0.28)',
    textPrimary: '#F8FAFC',
    textMuted: '#F1D5DB',
    shadow: '0 14px 44px rgba(157, 23, 77, 0.35)',
    patternTint: 'rgba(251, 113, 133, 0.08)',
  },
  'emerald-glass': {
    label: 'Emerald Glass',
    pageGradient: 'linear-gradient(135deg, #052E2B 0%, #0A0F0C 52%, #065F46 100%)',
    topTint: 'rgba(3, 7, 18, 0.62)',
    heroOverlay: 'linear-gradient(90deg, rgba(6,78,59,0.82) 0%, rgba(3,105,72,0.72) 52%, rgba(16,185,129,0.66) 100%)',
    accent: '#10B981',
    secondary: '#065F46',
    success: '#22C55E',
    danger: '#F87171',
    cardBg: 'rgba(2, 24, 20, 0.56)',
    cardBorder: 'rgba(16, 185, 129, 0.24)',
    textPrimary: '#D1FAE5',
    textMuted: '#A7F3D0',
    shadow: '0 12px 40px rgba(6, 78, 59, 0.34)',
    patternTint: 'rgba(16, 185, 129, 0.08)',
  },
}

export default function HotelBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>('ocean-night')
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [showFees, setShowFees] = useState(false)
  const [mobileOpenSections, setMobileOpenSections] = useState<Record<string, boolean>>({
    hotel: true,
    dates: true,
    summary: true,
    actions: true,
    requests: true,
  })
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const themeMenuRef = useRef<HTMLDivElement | null>(null)
  
  const { data: booking, isLoading, error } = useHotelBookingById(bookingId)
  const { confirmBooking, cancelBooking } = useHotelBooking()

  const activeTheme = themeTokens[theme]

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'ocean-night' || storedTheme === 'sunset-luxe' || storedTheme === 'emerald-glass') {
      setTheme(storedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (themeMenuRef.current && !themeMenuRef.current.contains(target)) {
        setThemeMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const computedBaseAmount = useMemo(() => {
    if (!booking) return 0
    if (booking.booking_details?.pricing?.base_price_per_night) {
      return booking.booking_details.pricing.base_price_per_night * booking.booking_details.pricing.nights * booking.booking_details.pricing.quantity
    }
    const unitPrice = booking.roomType?.pricePerNight || booking.booking_details?.room_type?.price_per_night || 0
    const nights = booking.booking_details?.dates?.nights || 1
    return unitPrice * nights * (booking.quantity || 1)
  }, [booking])

  const computedTotalAmount = useMemo(() => {
    if (!booking) return 0
    return booking.booking_details?.pricing?.total_amount || booking.totalAmount || 0
  }, [booking])

  const computedTaxFee = Math.max(computedTotalAmount - computedBaseAmount, 0)

  useEffect(() => {
    const target = Number(computedTotalAmount || 0)
    let frameId = 0
    const start = performance.now()
    const duration = 900

    const step = (timestamp: number) => {
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedTotal(Math.floor(target * eased))
      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setAnimatedTotal(target)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [computedTotalAmount])

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    switch (normalizedStatus) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
        return 'border border-green-400/40 bg-green-500/20 text-green-200 shadow-[0_0_20px_rgba(34,197,94,0.25)]'
      case 'PENDING_PAYMENT':
      case 'PENDING':
        return 'border border-yellow-300/40 bg-yellow-500/20 text-yellow-100'
      case 'CANCELLED':
        return 'border border-red-400/40 bg-red-500/20 text-red-100'
      case 'CHECKED_OUT':
      case 'COMPLETED':
        return 'border border-cyan-300/40 bg-cyan-500/20 text-cyan-100'
      default:
        return 'border border-slate-300/30 bg-slate-500/20 text-slate-100'
    }
  }
  
  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    switch (normalizedStatus) {
      case 'PENDING_PAYMENT':
        return 'Pending Payment'
      case 'CONFIRMED':
        return 'Confirmed'
      case 'CANCELLED':
        return 'Cancelled'
      case 'CHECKED_IN':
        return 'Checked In'
      case 'CHECKED_OUT':
        return 'Checked Out'
      default:
        return status
    }
  }
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  const parseCheckInDate = (value: string | undefined) => {
    if (!value) return null
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value
    const parsed = new Date(normalized)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'N/A'
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const checkInRaw = booking?.checkInDate || booking?.booking_details?.dates?.check_in
  const checkInDate = parseCheckInDate(checkInRaw)
  const cancellationDeadline = checkInDate ? new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000) : null
  const canCancelByDate = cancellationDeadline ? new Date() < cancellationDeadline : false
  const cancelDisabled = cancelling || !canCancelByDate

  const toggleMobileSection = (sectionKey: string) => {
    setMobileOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
  }

  const glassCardClass = 'rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1'

  const SectionCard = ({
    sectionKey,
    title,
    children,
    className = '',
    rightNode,
  }: {
    sectionKey: string
    title: string
    children: React.ReactNode
    className?: string
    rightNode?: React.ReactNode
  }) => {
    const isOpen = mobileOpenSections[sectionKey]
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`${glassCardClass} h-full overflow-hidden ${className}`}
        style={{
          background: activeTheme.cardBg,
          borderColor: PAGE_BORDER_COLOR,
          boxShadow: `${activeTheme.shadow}, 0 0 0 1px rgba(59, 130, 246, 0.32)`,
        }}
      >
        <div
          className="flex items-center justify-between gap-4 border-b px-6 py-6"
          style={{ borderColor: PAGE_BORDER_COLOR }}
        >
          <h3 className="text-lg font-semibold" style={{ color: PAGE_TEXT_COLOR }}>{title}</h3>
          <div className="flex items-center gap-3">
            {rightNode}
            <button
              type="button"
              className="md:hidden rounded-lg border p-1.5"
              style={{ borderColor: PAGE_BORDER_COLOR, color: PAGE_TEXT_COLOR }}
              onClick={() => toggleMobileSection(sectionKey)}
              aria-label={`Toggle ${title}`}
            >
              <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`${isOpen ? 'block' : 'hidden'} md:block px-6 pb-6`}>{children}</div>
      </motion.div>
    )
  }

  const rootStyle: React.CSSProperties = {
    background: PAGE_BACKGROUND_GRADIENT,
    transition: 'all 260ms ease-in-out',
  }

  const topTintStyle: React.CSSProperties = {
    background: 'transparent',
    transition: 'all 260ms ease-in-out',
  }

  const heroOverlayStyle: React.CSSProperties = {
    background: activeTheme.heroOverlay,
    transition: 'all 260ms ease-in-out',
  }

  const patternStyle: React.CSSProperties = {
    backgroundImage:
      `radial-gradient(circle at 20% 20%, ${activeTheme.patternTint} 0, transparent 44%), radial-gradient(circle at 78% 12%, ${activeTheme.patternTint} 0, transparent 38%), radial-gradient(circle at 50% 80%, ${activeTheme.patternTint} 0, transparent 42%)`,
  }

  const worldMapStyle: React.CSSProperties = {
    backgroundImage: `url('${WORLD_MAP_IMAGE}')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    opacity: 0.065,
    filter: 'contrast(1.05) saturate(1.05)',
  }
  
  const handleConfirm = async () => {
    if (!confirm('Are you sure you want to confirm this booking? This will process the payment.')) {
      return
    }
    
    setConfirming(true)
    try {
      await confirmBooking.mutateAsync(bookingId)
      alert('Booking confirmed successfully! You will receive a confirmation notification.')
      router.push('/client/bookings')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to confirm booking'
      alert(`Error: ${errorMessage}`)
    } finally {
      setConfirming(false)
    }
  }
  
  const handleCancel = async () => {
    if (!canCancelByDate) {
      alert(`Cancellation is closed. You could cancel only until ${formatDateTime(cancellationDeadline)} (one day before check-in).`)
      return
    }

    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }
    
    setCancelling(true)
    try {
      await cancelBooking.mutateAsync(bookingId)
      alert('Booking cancelled successfully!')
      router.push('/client/bookings')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel booking'
      alert(`Error: ${errorMessage}`)
    } finally {
      setCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden" style={rootStyle}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[560px]" style={topTintStyle} />
          <div className="absolute inset-0" style={patternStyle} />
        </div>
        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="animate-pulse h-16 rounded-2xl" style={{ background: activeTheme.cardBg, border: `1px solid ${PAGE_BORDER_COLOR}` }} />
          <div className="animate-pulse h-36 rounded-2xl" style={{ background: activeTheme.cardBg, border: `1px solid ${PAGE_BORDER_COLOR}` }} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="animate-pulse h-56 rounded-2xl" style={{ background: activeTheme.cardBg, border: `1px solid ${PAGE_BORDER_COLOR}` }} />
              <div className="animate-pulse h-48 rounded-2xl" style={{ background: activeTheme.cardBg, border: `1px solid ${PAGE_BORDER_COLOR}` }} />
            </div>
            <div className="animate-pulse h-72 rounded-2xl" style={{ background: activeTheme.cardBg, border: `1px solid ${PAGE_BORDER_COLOR}` }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="relative min-h-screen overflow-hidden" style={rootStyle}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[560px]" style={topTintStyle} />
          <div className="absolute inset-0" style={patternStyle} />
        </div>
        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-6">
          <div className="rounded-2xl border p-12 text-center backdrop-blur-lg" style={{ background: activeTheme.cardBg, borderColor: PAGE_BORDER_COLOR, boxShadow: `${activeTheme.shadow}, 0 0 0 1px rgba(59, 130, 246, 0.32)` }}>
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: PAGE_TEXT_COLOR }}>
            Booking not found
          </h1>
          <p className="mb-6" style={{ color: PAGE_TEXT_COLOR }}>
            The booking you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/client/bookings">
            <Button className="text-white" style={{ background: `linear-gradient(90deg, ${activeTheme.secondary} 0%, ${activeTheme.accent} 100%)` }}>Back to Bookings</Button>
          </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={rootStyle}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[560px]" style={topTintStyle} />
        <div className="absolute inset-0" style={patternStyle} />
        <div className="absolute inset-0" style={worldMapStyle} />
        <div className="absolute inset-0" style={worldMapStyle} />
        <div className="absolute inset-0" style={worldMapStyle} />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-6 py-6">
        <div className="relative mb-6 overflow-hidden rounded-2xl border" style={{ borderColor: PAGE_BORDER_COLOR, boxShadow: activeTheme.shadow }}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')" }}
          />
          <div className="absolute inset-0" style={heroOverlayStyle} />
          <div className="relative z-10 p-6 md:p-8">
            <Link href="/client/bookings" className="mb-4 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#E2E8F0' }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Bookings
            </Link>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl" style={{ color: PAGE_TEXT_COLOR }}>Booking Details</h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base" style={{ color: PAGE_TEXT_COLOR }}>
              View and manage your booking
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: PAGE_BORDER_COLOR, background: 'rgba(15,23,42,0.35)', color: PAGE_TEXT_COLOR }}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 8h10M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              Booking ID #{booking.id}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-6 pb-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <SectionCard
              sectionKey="hotel"
              title="Hotel Information"
              className="min-h-[360px]"
              rightNode={
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              }
            >
              <div>
                <h3 className="text-2xl font-semibold" style={{ color: PAGE_TEXT_COLOR }}>{booking.hotel?.name}</h3>
                <p style={{ color: PAGE_TEXT_COLOR }}>{booking.hotel?.address}</p>
                <p style={{ color: PAGE_TEXT_COLOR }}>{booking.hotel?.location}</p>
                <div className="mt-2 flex items-center gap-1.5" style={{ color: '#FBBF24' }}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg key={idx} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="my-4 h-px" style={{ background: PAGE_BORDER_COLOR }} />
              <div className="my-4 h-px" style={{ background: PAGE_BORDER_COLOR }} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex h-full flex-col gap-2 rounded-xl border p-3 min-h-[88px]" style={{ borderColor: PAGE_BORDER_COLOR, background: 'rgba(15,23,42,0.2)' }}>
                  <p className="flex items-center gap-2 text-sm leading-none" style={{ color: PAGE_TEXT_COLOR }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 8h10M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    </svg>
                    Room Type
                  </p>
                  <p className="font-medium leading-snug" style={{ color: PAGE_TEXT_COLOR }}>{booking.roomType?.name}</p>
                </div>
                <div className="flex h-full flex-col gap-2 rounded-xl border p-3 min-h-[88px]" style={{ borderColor: PAGE_BORDER_COLOR, background: 'rgba(15,23,42,0.2)' }}>
                  <p className="flex items-center gap-2 text-sm leading-none" style={{ color: PAGE_TEXT_COLOR }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m12 0H7m10-10a2 2 0 11-4 0 2 2 0 014 0zM11 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Capacity
                  </p>
                  <p className="font-medium leading-snug" style={{ color: PAGE_TEXT_COLOR }}>{booking.roomType?.capacity} guests</p>
                </div>
                <div className="flex h-full flex-col gap-2 rounded-xl border p-3 min-h-[88px]" style={{ borderColor: PAGE_BORDER_COLOR, background: 'rgba(15,23,42,0.2)' }}>
                  <p className="flex items-center gap-2 text-sm leading-none" style={{ color: PAGE_TEXT_COLOR }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
                    </svg>
                    Quantity
                  </p>
                  <p className="font-medium leading-snug" style={{ color: PAGE_TEXT_COLOR }}>{booking.quantity} room(s)</p>
                </div>
                <div className="flex h-full flex-col gap-2 rounded-xl border p-3 min-h-[88px]" style={{ borderColor: PAGE_BORDER_COLOR, background: 'rgba(15,23,42,0.2)' }}>
                  <p className="flex items-center gap-2 text-sm leading-none" style={{ color: PAGE_TEXT_COLOR }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
                    </svg>
                    Price per Night
                  </p>
                  <p className="font-medium leading-snug" style={{ color: PAGE_TEXT_COLOR }}>
                    {booking.currency?.toUpperCase() || 'PKR'} {
                      (booking.roomType?.pricePerNight || booking.booking_details?.room_type?.price_per_night || 0).toLocaleString()
                    }
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard sectionKey="dates" title="Booking Dates" className="min-h-[220px]">
              <div className="relative">
                <div className="absolute left-[9px] top-3 h-[calc(100%-30px)] w-px" style={{ background: PAGE_BORDER_COLOR }} />

                <div className="relative mb-3 pl-8">
                  <span className="absolute left-0 top-2 inline-block h-[18px] w-[18px] rounded-full border-2" style={{ borderColor: '#10B981', background: '#10B981' }} />
                  <p className="flex items-center gap-2 text-sm" style={{ color: PAGE_TEXT_COLOR }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Check-in
                  </p>
                  <p className="text-lg font-semibold" style={{ color: PAGE_TEXT_COLOR }}>
                    {formatDate(booking.checkInDate || booking.booking_details?.dates?.check_in)}
                  </p>
                </div>

                <div className="relative pl-8">
                  <span className="absolute left-0 top-2 inline-block h-[18px] w-[18px] rounded-full border-2" style={{ borderColor: '#2563EB', background: '#2563EB' }} />
                  <p className="flex items-center gap-2 text-sm" style={{ color: PAGE_TEXT_COLOR }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Check-out
                  </p>
                  <p className="text-lg font-semibold" style={{ color: PAGE_TEXT_COLOR }}>
                    {formatDate(booking.checkOutDate || booking.booking_details?.dates?.check_out)}
                  </p>
                </div>
              </div>

              <div className="my-3 h-px" style={{ background: PAGE_BORDER_COLOR }} />

              {booking.booking_details?.dates?.nights && (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(20,184,166,0.2)', color: PAGE_TEXT_COLOR, border: `1px solid ${PAGE_BORDER_COLOR}` }}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duration: {booking.booking_details.dates.nights} night(s)
                </span>
              )}
            </SectionCard>

            {booking.booking_details?.guest_notes && (
              <SectionCard sectionKey="requests" title="Special Requests">
                <p style={{ color: PAGE_TEXT_COLOR }}>{booking.booking_details.guest_notes}</p>
              </SectionCard>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1 lg:self-start">
          <div className="sticky top-24 space-y-6">
            <SectionCard sectionKey="summary" title="Pricing Summary" className="min-h-[320px]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm" style={{ color: PAGE_TEXT_COLOR }}>
                  <span>Base Price</span>
                  <span style={{ color: PAGE_TEXT_COLOR }}>PKR {computedBaseAmount.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFees(prev => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs underline underline-offset-4"
                  style={{ color: activeTheme.accent }}
                >
                  {showFees ? 'Hide taxes/fees' : 'Show taxes/fees'}
                </button>

                <AnimatePresence>
                  {showFees && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex justify-between text-sm" style={{ color: PAGE_TEXT_COLOR }}>
                        <span>Taxes/Fees</span>
                        <span style={{ color: PAGE_TEXT_COLOR }}>PKR {computedTaxFee.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="my-3 h-px" style={{ background: PAGE_BORDER_COLOR }} />

                <div className="flex items-end justify-between">
                  <span className="text-sm" style={{ color: PAGE_TEXT_COLOR }}>Total Amount</span>
                  <span className="text-3xl font-bold" style={{ color: PAGE_TEXT_COLOR }}>
                    PKR {animatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-1 border-t pt-4" style={{ borderColor: PAGE_BORDER_COLOR }}>
                <p className="text-xs" style={{ color: PAGE_TEXT_COLOR }}>Booking ID: {booking.id}</p>
                <p className="text-xs" style={{ color: PAGE_TEXT_COLOR }}>
                  Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </SectionCard>

            <SectionCard sectionKey="actions" title="Actions" className="min-h-[420px]">
              <div className="space-y-4 text-center pt-4 pb-4">
                {booking.status === 'PENDING_PAYMENT' && (
                    <Button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full h-12 text-white transition-all duration-300 hover:scale-[1.01]"
                    style={{ background: CONFIRM_BUTTON_BACKGROUND }}
                  >
                    {confirming ? 'Confirming...' : 'Confirm & Pay'}
                  </Button>
                )}

                <Link href={`/client/hotels/${booking.hotelId}`}>
                  <Button
                    className="w-full h-12 text-white transition-all duration-300 hover:scale-[1.01]"
                    style={{ background: `linear-gradient(90deg, ${activeTheme.secondary} 0%, ${activeTheme.accent} 100%)` }}
                  >
                    View Hotel
                  </Button>
                </Link>

                {(booking.status === 'PENDING_PAYMENT' || booking.status === 'CONFIRMED') && (
                  <>
                    <Button
                      onClick={handleCancel}
                      disabled={cancelDisabled}
                      className="w-full h-12 text-white transition-all duration-300"
                      style={{
                        borderColor: '#EF4444',
                        background: CANCEL_BUTTON_BACKGROUND,
                        opacity: cancelDisabled ? 0.6 : 1,
                      }}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>

                    <div className="mt-4 rounded-md p-3" style={{ borderLeft: `4px solid ${PAGE_BORDER_COLOR}` }}>
                      <p className="flex items-start gap-2 text-left text-xs" style={{ color: canCancelByDate ? activeTheme.textMuted : '#FCA5A5' }}>
                        <svg className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {canCancelByDate
                            ? `You can cancel this booking until ${formatDateTime(cancellationDeadline)} (one day before check-in).`
                            : `Cancellation closed. Last cancellation date was ${formatDateTime(cancellationDeadline)} (one day before check-in).`}
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
      </div>

      <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-2xl border p-3 backdrop-blur-xl md:hidden" style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder, boxShadow: `${activeTheme.shadow}, 0 0 0 1px rgba(59, 130, 246, 0.32)` }}>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/client/hotels/${booking.hotelId}`}>
            <Button className="w-full text-white" style={{ background: `linear-gradient(90deg, ${activeTheme.secondary} 0%, ${activeTheme.accent} 100%)` }}>
              View Hotel
            </Button>
          </Link>
          {(booking.status === 'PENDING_PAYMENT' || booking.status === 'CONFIRMED') ? (
            <Button
              onClick={handleCancel}
              disabled={cancelDisabled}
              className="w-full text-white"
              style={{ borderColor: '#EF4444', background: CANCEL_BUTTON_BACKGROUND, opacity: cancelDisabled ? 0.6 : 1 }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full" style={{ borderColor: PAGE_BORDER_COLOR, color: PAGE_TEXT_COLOR }}>
              Unavailable
            </Button>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-40" ref={themeMenuRef}>
        <AnimatePresence>
          {themeMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              className="mb-2 w-52 rounded-2xl border p-2 backdrop-blur-xl"
              style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder, boxShadow: `${activeTheme.shadow}, 0 0 0 1px rgba(59, 130, 246, 0.32)` }}
            >
              {(Object.keys(themeTokens) as ThemeMode[]).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setTheme(mode)
                    setThemeMenuOpen(false)
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${theme === mode ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  style={{ color: PAGE_TEXT_COLOR }}
                >
                  {themeTokens[mode].label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          className="h-12 w-12 rounded-full border text-white shadow-lg"
          style={{
            borderColor: activeTheme.cardBorder,
            background: `linear-gradient(135deg, ${activeTheme.secondary} 0%, ${activeTheme.accent} 100%)`,
          }}
          onClick={() => setThemeMenuOpen(prev => !prev)}
          aria-label="Change theme"
        >
          <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}


