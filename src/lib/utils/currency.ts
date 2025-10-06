export const CURRENCIES = {
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

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES]

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount
  
  // Convert to USD first if not already
  let usdAmount = amount
  if (fromCurrency !== 'USD') {
    usdAmount = amount / exchangeRates[fromCurrency]
  }
  
  // Convert from USD to target currency
  if (toCurrency !== 'USD') {
    return usdAmount * exchangeRates[toCurrency]
  }
  
  return usdAmount
}

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''))
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$',
  }
  
  return symbols[currency]
}
