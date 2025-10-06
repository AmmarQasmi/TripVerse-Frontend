export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export function isDateInFuture(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

export function isDateInPast(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

export function getDateRange(startDate: string, endDate: string): Date[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: Date[] = []
  
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    dates.push(new Date(d))
  }
  
  return dates
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getTomorrow(): Date {
  return addDays(new Date(), 1)
}

export function getNextWeek(): Date {
  return addDays(new Date(), 7)
}
