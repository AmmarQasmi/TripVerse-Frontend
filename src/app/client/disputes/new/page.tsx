'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { useUserHotelBookings } from '@/features/bookings/useHotelBooking'
import { useUserCarBookings } from '@/features/bookings/useCarBooking'
import { useCreateDispute, DisputeCategory } from '@/features/bookings/useCreateDispute'

const CATEGORY_OPTIONS: { value: DisputeCategory; label: string; icon: string; hint: string }[] = [
  { value: 'service',     label: 'Service Quality',  icon: '⭐', hint: 'Poor service, rudeness, no-show, etc.' },
  { value: 'pricing',     label: 'Pricing Dispute',   icon: '💰', hint: 'Overcharged, hidden fees, billing errors.' },
  { value: 'cleanliness', label: 'Cleanliness',       icon: '🧹', hint: 'Dirty car / room, hygiene concerns.' },
  { value: 'safety',      label: 'Safety Concern',    icon: '🚨', hint: 'Dangerous driving, unsafe conditions. Evidence required.' },
  { value: 'fraud',       label: 'Fraud / Scam',      icon: '🔒', hint: 'Deliberate deception or theft. Evidence required.' },
]

const EVIDENCE_REQUIRED: Record<DisputeCategory, boolean> = {
  service: false, pricing: false, cleanliness: false, safety: true, fraud: true,
}

// Filing window in hours per category (matches backend)
const FILING_WINDOW_HOURS: Record<DisputeCategory, number> = {
  service: 48, pricing: 168, cleanliness: 48, safety: 168, fraud: 720,
}

function isWithinWindow(bookingEndDate: string | undefined, category: DisputeCategory): boolean {
  if (!bookingEndDate) return true
  const hrs = (Date.now() - new Date(bookingEndDate).getTime()) / 3_600_000
  return hrs <= FILING_WINDOW_HOURS[category]
}

export default function NewDisputePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL-injected pre-selection (from "File Complaint" button on booking cards)
  const preType = (searchParams.get('type') ?? 'car') as 'hotel' | 'car'
  const preBookingId = searchParams.get('bookingId') ? Number(searchParams.get('bookingId')) : null
  const isPreSelected = !!preBookingId

  const [bookingType, setBookingType]       = useState<'hotel' | 'car'>(preType)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(preBookingId)
  const [category, setCategory]             = useState<DisputeCategory>('service')
  const [description, setDescription]       = useState('')
  const [incidentAt, setIncidentAt]         = useState('')
  const [evidenceFiles, setEvidenceFiles]   = useState<File[]>([])
  const [errors, setErrors]                 = useState<Record<string, string>>({})
  const [submitted, setSubmitted]           = useState(false)
  const [scoreResult, setScoreResult]       = useState<any>(null)

  // Sync if URL params change after mount
  useEffect(() => {
    if (preBookingId) setSelectedBookingId(preBookingId)
    setBookingType(preType)
  }, [preBookingId, preType])

  const { data: hotelBookings, isLoading: loadingHotel } = useUserHotelBookings()
  const { data: carBookingsData,  isLoading: loadingCar  } = useUserCarBookings()
  const { createDispute, isPending } = useCreateDispute()

  const carBookings         = (carBookingsData as any)?.bookings ?? carBookingsData ?? []
  const eligibleHotelBookings = (hotelBookings ?? []).filter(
    (b: any) => b.status === 'CHECKED_OUT' || b.status === 'CONFIRMED',
  )
  const eligibleCarBookings = (carBookings ?? []).filter(
    (b: any) => b.status === 'COMPLETED' || b.status === 'CONFIRMED',
  )
  const bookingList = bookingType === 'hotel' ? eligibleHotelBookings : eligibleCarBookings

  // Locate the pre-selected booking object for the summary card
  const preSelectedBooking = isPreSelected
    ? bookingList.find((b: any) => b.id === selectedBookingId) ?? null
    : null

  const isLoading = loadingHotel || loadingCar

  const evidenceRequired = EVIDENCE_REQUIRED[category]

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (evidenceFiles.length + files.length > 5) {
      setErrors(prev => ({ ...prev, evidence: 'Maximum 5 files allowed.' }))
      return
    }
    setEvidenceFiles(prev => [...prev, ...files])
    setErrors(prev => { const n = { ...prev }; delete n.evidence; return n })
  }

  const removeFile = (idx: number) => setEvidenceFiles(prev => prev.filter((_, i) => i !== idx))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!selectedBookingId) errs.booking = 'Please select a booking.'
    if (description.trim().length < 20) errs.description = 'Description must be at least 20 characters.'
    if (evidenceRequired && evidenceFiles.length === 0)
      errs.evidence = `At least one evidence file is required for ${category} complaints.`
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const result = await createDispute({
        ...(bookingType === 'hotel'
          ? { booking_hotel_id: selectedBookingId! }
          : { booking_car_id: selectedBookingId! }),
        category,
        description: description.trim(),
        incident_at: incidentAt || undefined,
        evidence: evidenceFiles.length > 0 ? evidenceFiles : undefined,
      })
      setScoreResult((result as any)?.scoring)
      setSubmitted(true)
    } catch (err: any) {
      setErrors({
        submit:
          err?.response?.data?.message ??
          err?.message ??
          'Failed to submit complaint. Please try again.',
      })
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) return <PageLoader message="Loading your bookings..." variant="skeleton" />

  // ── Determine back URL ───────────────────────────────────────────────────
  const backUrl = isPreSelected
    ? bookingType === 'car' ? '/client/cars/bookings' : '/client/bookings'
    : '/client/dashboard'
  const backLabel = isPreSelected
    ? bookingType === 'car' ? 'Back to Car Bookings' : 'Back to Hotel Bookings'
    : 'Back to Dashboard'

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader title="Complaint Submitted" subtitle="Your complaint has been received" backUrl={backUrl} backLabel={backLabel} />
        <div className="container mx-auto px-4 py-12 max-w-xl text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complaint Submitted</h2>
          <p className="text-gray-600 mb-6">
            Our automated system has evaluated your complaint. An admin will review it shortly.
          </p>

          {scoreResult && (
            <Card className="text-left mb-6">
              <CardHeader><CardTitle className="text-base">Automated Scoring Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Severity Score</span>
                  <span className="font-semibold text-gray-800">{scoreResult.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recommended Action</span>
                  <span className="font-semibold capitalize text-blue-700">
                    {scoreResult.recommendedAction?.replace(/_/g, ' ')}
                  </span>
                </div>
                {scoreResult.flags?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Flags</p>
                    <div className="flex flex-wrap gap-2">
                      {scoreResult.flags.map((f: string) => (
                        <span key={f} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push(backUrl)}>
              {bookingType === 'car' ? 'Back to Car Bookings' : 'Back to Hotel Bookings'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/client/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step numbering (step 1 is hidden when pre-selected) ─────────────────
  const stepNum = (n: number) => isPreSelected ? n - 1 : n

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="File a Complaint"
        subtitle={
          isPreSelected
            ? `Complaint for ${bookingType === 'car' ? '🚗 Car' : '🏨 Hotel'} Booking #${selectedBookingId}`
            : 'Report an issue with a recent booking'
        }
        backUrl={backUrl}
        backLabel={backLabel}
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Step 1: Booking selector (skipped when pre-selected) ───────── */}
          {isPreSelected ? (
            /* Pre-selected booking summary card */
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{bookingType === 'car' ? '🚗' : '🏨'}</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                      Filing complaint for
                    </p>
                    <p className="font-semibold text-gray-900">
                      {preSelectedBooking
                        ? bookingType === 'hotel'
                          ? preSelectedBooking.hotel?.name ?? `Hotel Booking #${selectedBookingId}`
                          : preSelectedBooking.car?.make
                            ? `${preSelectedBooking.car.make} ${preSelectedBooking.car.model}`
                            : `Car Booking #${selectedBookingId}`
                        : `${bookingType === 'hotel' ? 'Hotel' : 'Car'} Booking #${selectedBookingId}`}
                    </p>
                    {preSelectedBooking && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {bookingType === 'car'
                          ? `${preSelectedBooking.start_date ?? ''} – ${preSelectedBooking.end_date ?? ''}`
                          : `${preSelectedBooking.check_in ?? ''} – ${preSelectedBooking.check_out ?? ''}`}
                      </p>
                    )}
                    {/* Window warning per selected category */}
                    {preSelectedBooking && !isWithinWindow(
                      bookingType === 'car' ? preSelectedBooking.end_date : preSelectedBooking.check_out,
                      category,
                    ) && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ This booking may be outside the {FILING_WINDOW_HOURS[category]}h filing window for "{category}" complaints.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(backUrl)}
                    className="text-xs text-blue-500 hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Full booking picker */
            <Card>
              <CardHeader><CardTitle className="text-base">1. Select the Booking</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  {(['car', 'hotel'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setBookingType(type); setSelectedBookingId(null) }}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        bookingType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type === 'car' ? '🚗 Car Booking' : '🏨 Hotel Booking'}
                    </button>
                  ))}
                </div>

                {bookingList.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No eligible {bookingType} bookings found. Only completed bookings can have complaints filed.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {bookingList.map((booking: any) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setSelectedBookingId(booking.id)}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                          selectedBookingId === booking.id
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {bookingType === 'hotel'
                              ? booking.hotel?.name ?? `Hotel Booking #${booking.id}`
                              : booking.car?.make
                                ? `${booking.car.make} ${booking.car.model} (#${booking.id})`
                                : `Car Booking #${booking.id}`}
                          </span>
                          <span className="text-xs text-gray-400">
                            {bookingType === 'hotel'
                              ? `${booking.check_in ?? ''} – ${booking.check_out ?? ''}`
                              : `${booking.start_date ?? ''} – ${booking.end_date ?? ''}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {errors.booking && <p className="text-xs text-red-500">{errors.booking}</p>}
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: Category ───────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{stepNum(2)}. Complaint Category</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    category === opt.value
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{opt.icon}</span>
                    <span className="font-medium text-sm">{opt.label}</span>
                    {EVIDENCE_REQUIRED[opt.value] && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                        Evidence req.
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{opt.hint}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Filing window: {FILING_WINDOW_HOURS[opt.value] < 168
                      ? `${FILING_WINDOW_HOURS[opt.value]}h`
                      : `${FILING_WINDOW_HOURS[opt.value] / 24} days`} after booking completion
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* ── Step 3: Description + incident time ───────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{stepNum(3)}. Describe the Issue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (e.target.value.trim().length >= 20)
                      setErrors(prev => { const n = { ...prev }; delete n.description; return n })
                  }}
                  rows={5}
                  placeholder="Please describe exactly what happened. Minimum 20 characters."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                    errors.description ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="text-xs text-red-500">{errors.description}</p>
                    : <span />}
                  <p className={`text-xs ${description.length < 20 ? 'text-gray-400' : 'text-green-600'}`}>
                    {description.length} / 20 min chars
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  When did this happen?{' '}
                  <span className="text-gray-400 font-normal">(optional but recommended)</span>
                </label>
                <input
                  type="datetime-local"
                  value={incidentAt}
                  onChange={(e) => setIncidentAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Providing the exact incident time improves complaint credibility and scoring.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Step 4: Evidence ───────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {stepNum(4)}. Evidence
                {evidenceRequired && (
                  <span className="text-xs font-normal bg-red-100 text-red-600 px-2 py-0.5 rounded">
                    Required for {category}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">
                Photos, videos, or screenshots (max 5 files, 10 MB each). Higher quality evidence
                improves your complaint score.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={evidenceFiles.length >= 5}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
              >
                📎 {evidenceFiles.length >= 5 ? 'Maximum files reached' : 'Add evidence files'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime"
                className="hidden"
                onChange={handleFileChange}
              />

              {evidenceFiles.length > 0 && (
                <ul className="space-y-2">
                  {evidenceFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                      <span className="truncate text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {errors.evidence && <p className="text-xs text-red-500">{errors.evidence}</p>}
            </CardContent>
          </Card>

          {/* ── Submit ─────────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Submitting...' : 'Submit Complaint'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
