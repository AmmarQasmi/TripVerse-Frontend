export const PAYMENT_METHODS = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  PAYPAL: 'PAYPAL',
  STRIPE: 'STRIPE',
  WALLET: 'WALLET',
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

export const PAYMENT_CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  CNY: 'CNY',
  SEK: 'SEK',
  NZD: 'NZD',
} as const

export type PaymentCurrency = typeof PAYMENT_CURRENCIES[keyof typeof PAYMENT_CURRENCIES]

export const TRANSACTION_TYPES = {
  BOOKING: 'BOOKING',
  REFUND: 'REFUND',
  COMMISSION: 'COMMISSION',
  WITHDRAWAL: 'WITHDRAWAL',
  DEPOSIT: 'DEPOSIT',
} as const

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES]

export const COMMISSION_RATES = {
  HOTEL_BOOKING: 0.10, // 10%
  CAR_BOOKING: 0.15,   // 15%
} as const

export function calculateCommission(
  amount: number,
  bookingType: 'hotel' | 'car'
): number {
  const rate = bookingType === 'hotel' 
    ? COMMISSION_RATES.HOTEL_BOOKING 
    : COMMISSION_RATES.CAR_BOOKING
  
  return amount * rate
}

export function calculateNetAmount(
  amount: number,
  bookingType: 'hotel' | 'car'
): number {
  const commission = calculateCommission(amount, bookingType)
  return amount - commission
}

export const PAYMENT_PROCESSORS = {
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  SQUARE: 'SQUARE',
} as const

export type PaymentProcessor = typeof PAYMENT_PROCESSORS[keyof typeof PAYMENT_PROCESSORS]

export const FEE_TYPES = {
  PROCESSING: 'PROCESSING',
  COMMISSION: 'COMMISSION',
  REFUND: 'REFUND',
  CHARGEBACK: 'CHARGEBACK',
} as const

export type FeeType = typeof FEE_TYPES[keyof typeof FEE_TYPES]

export const STRIPE_WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  CHARGE_DISPUTE_CREATED: 'charge.dispute.created',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[keyof typeof STRIPE_WEBHOOK_EVENTS]
