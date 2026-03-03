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

const CATEGORY_OPTIONS: { value: DisputeCategory; label: string; icon: string; evidenceRequired?: boolean }[] = [
  { value: 'service',      label: 'Service Quality',   icon: '⭐' },
  { value: 'pricing',      label: 'Pricing Dispute',   icon: '💰' },
  { value: 'cleanliness',  label: 'Cleanliness',       icon: '🧹' },
  { value: 'safety',       label: 'Safety Concern',    icon: '🚨', evidenceRequired: true },
  { value: 'fraud',        label: 'Fraud / Scam',      icon: '🔒', evidenceRequired: true },
  { value: 'harassment',   label: 'Harassment',        icon: '😤' },
  { value: 'rash_driving', label: 'Rash Driving',      icon: '💨' },
  { value: 'verbal_abuse', label: 'Verbal Abuse',      icon: '🗣️' },
]

// Filing window in hours per category (matches backend) — used for window warning
const FILING_WINDOW_HOURS: Record<DisputeCategory, number> = {
  service: 48, pricing: 168, cleanliness: 48, safety: 168, fraud: 720,
  harassment: 72, rash_driving: 72, verbal_abuse: 72,
}

function maxWindowHours(cats: DisputeCategory[]): number {
  return Math.max(...cats.map((c) => FILING_WINDOW_HOURS[c]))
}

function isWithinWindow(bookingEndDate: string | undefined, cats: DisputeCategory[]): boolean {
  if (!bookingEndDate || cats.length === 0) return true
  const hrs = (Date.now() - new Date(bookingEndDate).getTime()) / 3_600_000
  return hrs <= maxWindowHours(cats)
}

export default function NewDisputePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL-injected pre-selection (from "File Complaint" button on booking cards)
  const preType = (searchParams.get('type') ?? 'car') as 'hotel' | 'car'
  const preBookingId = searchParams.get('bookingId') ? Number(searchParams.get('bookingId')) : null
  const isPreSelected = !!preBookingId

  const [bookingType, setBookingType]             = useState<'hotel' | 'car'>(preType)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(preBookingId)
  const [selectedCategories, setSelectedCategories] = useState<DisputeCategory[]>([])
  const [customDescription, setCustomDescription]   = useState('')
  const [incidentAt, setIncidentAt]               = useState('')
  const [evidenceFiles, setEvidenceFiles]         = useState<File[]>([])
  const [errors, setErrors]                       = useState<Record<string, string>>({})
  const [submitted, setSubmitted]                 = useState(false)

  // Sync if URL params change after mount
  useEffect(() => {
    if (preBookingId) setSelectedBookingId(preBookingId)
    setBookingType(preType)
  }, [preBookingId, preType])

  const { data: hotelBookings, isLoading: loadingHotel } = useUserHotelBookings()
  const { data: carBookingsData,  isLoading: loadingCar  } = useUserCarBookings()
  const { createDispute, isPending } = useCreateDispute()

  const carBookings           = (carBookingsData as any)?.bookings ?? carBookingsData ?? []
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

  const evidenceRequired = selectedCategories.includes('safety') || selectedCategories.includes('fraud')

  // ── Handlers ────────────────────────────────────────────────────────────
  const toggleCategory = (cat: DisputeCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
    setErrors((prev) => { const n = { ...prev }; delete n.categories; return n })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (evidenceFiles.length + files.length > 5) {
      setErrors((prev) => ({ ...prev, evidence: 'Maximum 5 files allowed.' }))
      return
    }
    setEvidenceFiles((prev) => [...prev, ...files])
    setErrors((prev) => { const n = { ...prev }; delete n.evidence; return n })
  }

  const removeFile = (idx: number) => setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!selectedBookingId)
      errs.booking = 'Please select a booking.'
    if (selectedCategories.length === 0)
      errs.categories = 'Please select at least one complaint reason.'
    if (!incidentAt)
      errs.incidentAt = 'Please provide the date and time of the incident.'
    if (evidenceRequired && evidenceFiles.length === 0)
      errs.evidence = 'At least one evidence file is required for safety / fraud complaints.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // Use customer's free-text if provided, otherwise auto-generate from categories
    const description = customDescription.trim()
      ? customDescription.trim()
      : `Complaint filed regarding: ${selectedCategories.join(', ')}`
    try {
      await createDispute({
        ...(bookingType === 'hotel'
          ? { booking_hotel_id: selectedBookingId! }
          : { booking_car_id: selectedBookingId! }),
        categories: selectedCategories,
        description,
        incident_at: incidentAt || undefined,
        evidence: evidenceFiles.length > 0 ? evidenceFiles : undefined,
      })
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
        <PageHeader title="Complaint" backUrl={backUrl} backLabel={backLabel} />
        <div className="container mx-auto px-4 py-20 max-w-md text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-800">Complaint Successfully Filed</h2>
        </div>
      </div>
    )
  }

  // ── Step numbering (step 1 hidden when pre-selected) ─────────────────────
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
                    {preSelectedBooking && selectedCategories.length > 0 && !isWithinWindow(
                      bookingType === 'car' ? preSelectedBooking.end_date : preSelectedBooking.check_out,
                      selectedCategories,
                    ) && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ This booking may be outside the filing window for your selected categories.
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

          {/* ── Step 2: Complaint Reasons (multi-select) ──────────────────── */}
          <Card className={errors.categories ? 'border-red-400' : ''}>
            <CardHeader>
              <CardTitle className="text-base">
                {stepNum(2)}. Reason(s) for Complaint{' '}
                <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORY_OPTIONS.map((opt) => {
                  const selected = selectedCategories.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleCategory(opt.value)}
                      className={`relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        selected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-1.5 right-2 text-white text-xs font-bold">✓</span>
                      )}
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-center leading-tight">{opt.label}</span>
                      {opt.evidenceRequired && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          selected ? 'bg-blue-500 text-white' : 'bg-red-100 text-red-600'
                        }`}>
                          Evidence req.
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {errors.categories && (
                <p className="text-xs text-red-500 mt-2">{errors.categories}</p>
              )}
              {selectedCategories.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400">Selected: {selectedCategories.join(', ')}</p>
                  <p className="text-xs text-blue-600">
                    ⏱ Est. resolution:{' '}
                    {selectedCategories.some(c => c === 'safety' || c === 'fraud')
                      ? '24–48 hours'
                      : selectedCategories.some(c => c === 'harassment' || c === 'rash_driving' || c === 'verbal_abuse')
                      ? '2–3 business days'
                      : '3–5 business days'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Step 3: Description (optional) ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {stepNum(3)}. Describe What Happened{' '}
                <span className="text-gray-400 font-normal text-sm">(Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Add any additional details about the incident that may help us investigate..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{customDescription.length}/500</p>
            </CardContent>
          </Card>

          {/* ── Step 4: When did it happen? ───────────────────────────────── */}
          <Card className={errors.incidentAt ? 'border-red-400' : ''}>
            <CardHeader>
              <CardTitle className="text-base">
                {stepNum(4)}. Date &amp; Time of Incident <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="datetime-local"
                value={incidentAt}
                onChange={(e) => {
                  setIncidentAt(e.target.value)
                  setErrors((prev) => { const n = { ...prev }; delete n.incidentAt; return n })
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.incidentAt ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.incidentAt && (
                <p className="text-xs text-red-500 mt-1">{errors.incidentAt}</p>
              )}
            </CardContent>
          </Card>

          {/* ── Step 5: Evidence ───────────────────────────────────────────── */}
          <Card className={errors.evidence ? 'border-red-400' : ''}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {stepNum(5)}. Evidence
                {evidenceRequired && (
                  <span className="text-xs font-normal bg-red-100 text-red-600 px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={evidenceFiles.length >= 5}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
              >
                📎 {evidenceFiles.length >= 5 ? 'Maximum files reached' : 'Add evidence files (max 5 · 10 MB each)'}
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
