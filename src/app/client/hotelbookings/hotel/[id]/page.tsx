'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useHotelBookingById, useHotelBooking } from '@/features/bookings/useHotelBooking'

export default function HotelBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  
  const { data: booking, isLoading, error } = useHotelBookingById(bookingId)
  const { confirmBooking, cancelBooking } = useHotelBooking()

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    switch (normalizedStatus) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
        return 'bg-green-100 text-green-800'
      case 'PENDING_PAYMENT':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'CHECKED_OUT':
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
  
  const handleConfirm = async () => {
    if (!confirm('Are you sure you want to confirm this booking? This will process the payment.')) {
      return
    }
    
    setConfirming(true)
    try {
      await confirmBooking.mutateAsync(bookingId)
      alert('Booking confirmed successfully! You will receive a confirmation notification.')
      router.push('/client/hotelbookings')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to confirm booking'
      alert(`Error: ${errorMessage}`)
    } finally {
      setConfirming(false)
    }
  }
  
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }
    
    setCancelling(true)
    try {
      await cancelBooking.mutateAsync(bookingId)
      alert('Booking cancelled successfully!')
      router.push('/client/hotelbookings')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel booking'
      alert(`Error: ${errorMessage}`)
    } finally {
      setCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Booking not found
          </h1>
          <p className="text-gray-600 mb-6">
            The booking you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/client/hotelbookings">
            <Button>Back to Bookings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/client/hotelbookings" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Bookings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Booking Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hotel Information</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{booking.hotel?.name}</h3>
                <p className="text-gray-600">{booking.hotel?.address}</p>
                <p className="text-gray-600">{booking.hotel?.location}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Room Type</p>
                  <p className="font-medium">{booking.roomType?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{booking.roomType?.capacity} guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{booking.quantity} room(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price per Night</p>
                  <p className="font-medium">
                    {booking.currency?.toUpperCase() || 'PKR'} {
                      (booking.roomType?.pricePerNight || 
                       booking.booking_details?.room_type?.price_per_night || 
                       0).toLocaleString()
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="font-medium text-lg">
                    {formatDate(booking.checkInDate || booking.booking_details?.dates?.check_in)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="font-medium text-lg">
                    {formatDate(booking.checkOutDate || booking.booking_details?.dates?.check_out)}
                  </p>
                </div>
              </div>
              {booking.booking_details?.dates?.nights && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{booking.booking_details.dates.nights} night(s)</p>
                </div>
              )}
            </CardContent>
          </Card>

          {booking.booking_details?.guest_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Special Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{booking.booking_details.guest_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.booking_details?.pricing ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Price ({booking.booking_details.pricing.nights} nights × {booking.booking_details.pricing.quantity} rooms)</span>
                      <span className="font-medium">{booking.booking_details.pricing.currency?.toUpperCase() || 'PKR'} {booking.booking_details.pricing.base_price_per_night * booking.booking_details.pricing.nights * booking.booking_details.pricing.quantity}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span>{booking.booking_details.pricing.currency?.toUpperCase() || 'PKR'} {booking.booking_details.pricing.total_amount?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>{booking.currency?.toUpperCase() || 'PKR'} {booking.totalAmount?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t space-y-2">
                <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
                <p className="text-xs text-gray-500">
                  Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t space-y-2">
                {booking.status === 'PENDING_PAYMENT' && (
                  <Button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {confirming ? 'Confirming...' : 'Confirm & Pay'}
                  </Button>
                )}
                {(booking.status === 'PENDING_PAYMENT' || booking.status === 'CONFIRMED') && (
                  <Button
                    onClick={handleCancel}
                    disabled={cancelling}
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 border-red-600"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </Button>
                )}
                <Link href={`/client/hotels/${booking.hotelId}`}>
                  <Button variant="outline" className="w-full">
                    View Hotel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

