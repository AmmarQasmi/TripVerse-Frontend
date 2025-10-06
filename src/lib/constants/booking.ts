export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
} as const

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS]

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

export const BOOKING_TYPES = {
  HOTEL: 'HOTEL',
  CAR: 'CAR',
} as const

export type BookingType = typeof BOOKING_TYPES[keyof typeof BOOKING_TYPES]

export const CANCELLATION_POLICIES = {
  FREE_CANCELLATION: 'FREE_CANCELLATION',
  MODERATE: 'MODERATE',
  STRICT: 'STRICT',
  NON_REFUNDABLE: 'NON_REFUNDABLE',
} as const

export type CancellationPolicy = typeof CANCELLATION_POLICIES[keyof typeof CANCELLATION_POLICIES]

export const REFUND_RULES: Record<CancellationPolicy, number> = {
  [CANCELLATION_POLICIES.FREE_CANCELLATION]: 100,
  [CANCELLATION_POLICIES.MODERATE]: 50,
  [CANCELLATION_POLICIES.STRICT]: 0,
  [CANCELLATION_POLICIES.NON_REFUNDABLE]: 0,
}

export function canCancelBooking(
  bookingDate: string,
  cancellationPolicy: CancellationPolicy
): boolean {
  const now = new Date()
  const booking = new Date(bookingDate)
  const hoursUntilBooking = (booking.getTime() - now.getTime()) / (1000 * 60 * 60)

  switch (cancellationPolicy) {
    case CANCELLATION_POLICIES.FREE_CANCELLATION:
      return hoursUntilBooking > 24
    case CANCELLATION_POLICIES.MODERATE:
      return hoursUntilBooking > 72
    case CANCELLATION_POLICIES.STRICT:
      return hoursUntilBooking > 168 // 7 days
    case CANCELLATION_POLICIES.NON_REFUNDABLE:
      return false
    default:
      return false
  }
}

export function getRefundAmount(
  totalAmount: number,
  cancellationPolicy: CancellationPolicy
): number {
  const refundPercentage = REFUND_RULES[cancellationPolicy]
  return (totalAmount * refundPercentage) / 100
}
