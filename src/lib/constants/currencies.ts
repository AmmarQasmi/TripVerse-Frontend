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

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [CURRENCIES.USD]: '$',
  [CURRENCIES.EUR]: '€',
  [CURRENCIES.GBP]: '£',
  [CURRENCIES.JPY]: '¥',
  [CURRENCIES.CAD]: 'C$',
  [CURRENCIES.AUD]: 'A$',
  [CURRENCIES.CHF]: 'CHF',
  [CURRENCIES.CNY]: '¥',
  [CURRENCIES.SEK]: 'kr',
  [CURRENCIES.NZD]: 'NZ$',
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  [CURRENCIES.USD]: 'US Dollar',
  [CURRENCIES.EUR]: 'Euro',
  [CURRENCIES.GBP]: 'British Pound',
  [CURRENCIES.JPY]: 'Japanese Yen',
  [CURRENCIES.CAD]: 'Canadian Dollar',
  [CURRENCIES.AUD]: 'Australian Dollar',
  [CURRENCIES.CHF]: 'Swiss Franc',
  [CURRENCIES.CNY]: 'Chinese Yuan',
  [CURRENCIES.SEK]: 'Swedish Krona',
  [CURRENCIES.NZD]: 'New Zealand Dollar',
}

export const CURRENCY_FORMATS: Record<Currency, Intl.NumberFormatOptions> = {
  [CURRENCIES.USD]: { style: 'currency', currency: 'USD' },
  [CURRENCIES.EUR]: { style: 'currency', currency: 'EUR' },
  [CURRENCIES.GBP]: { style: 'currency', currency: 'GBP' },
  [CURRENCIES.JPY]: { style: 'currency', currency: 'JPY', minimumFractionDigits: 0 },
  [CURRENCIES.CAD]: { style: 'currency', currency: 'CAD' },
  [CURRENCIES.AUD]: { style: 'currency', currency: 'AUD' },
  [CURRENCIES.CHF]: { style: 'currency', currency: 'CHF' },
  [CURRENCIES.CNY]: { style: 'currency', currency: 'CNY' },
  [CURRENCIES.SEK]: { style: 'currency', currency: 'SEK' },
  [CURRENCIES.NZD]: { style: 'currency', currency: 'NZD' },
}

export function formatCurrency(amount: number, currency: Currency): string {
  const format = CURRENCY_FORMATS[currency]
  return new Intl.NumberFormat('en-US', format).format(amount)
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency]
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency]
}

export const DEFAULT_CURRENCY = CURRENCIES.USD

export const SUPPORTED_CURRENCIES: Currency[] = Object.values(CURRENCIES)
