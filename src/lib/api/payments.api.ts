import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'

export interface WalletBalanceResponse {
  walletId: string
  balance: string
  reserved: string
  locked: string
  available: string
}

export interface WalletTransaction {
  id: string
  type: string
  amount: string
  description?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface WalletTransactionsResponse {
  walletId: string
  transactions: WalletTransaction[]
  total: number
}

export interface TopupInitResponse {
  topupId: string
  amountInPaisa: string
  status: string
  createdAt: string
  checkoutUrl?: string
  checkoutSessionId?: string
}

export interface AdminPaymentStatsResponse {
  walletStats: {
    totalBalance: string
    totalReserved: string
    totalLocked: string
    totalAvailable: string
  }
  debtStats: {
    pendingCount: number
    paidCount: number
    totalPending: string
    totalPaid: string
  }
  topupStats?: {
    pendingCount: number
    completedCount: number
    completedAmount?: string
  }
  commissionBreakdown: {
    platform: number
    tax: number
  }
  financialTotals?: {
    commissionWalletTotal: string
    platformCommissionCollected: string
    taxReserveCollected: string
    debtRecovered: string
    topupProcessed: string
    outstandingDebt: string
  }
  revenueTrend?: Array<{
    day: string
    amount: string
    commission: string
    tax: string
    debtRecovered: string
  }>
  transactionTypeBreakdown?: Array<{
    type: string
    amount: string
  }>
}

export interface EarningsSummaryResponse {
  walletId: string
  balance: {
    current: string
    available: string
  }
  debts: {
    pending: string
    count: number
  }
  earnings: {
    total: string
    fromTrips?: string
    topups?: string
    currentBalance: string
  }
}

export interface DebtRecord {
  id: string
  driverId: number
  driverName: string
  driverEmail: string
  bookingId: number
  amount: string
  status: string
  dueDate: string
  paidAt?: string
  createdAt: string
}

export interface DebtListResponse {
  debts: DebtRecord[]
  total: number
  limit: number
  offset: number
}

export interface AuditTrailResponse {
  transactions: Array<{
    id: string
    walletId: string
    userId: number
    userName: string
    userEmail: string
    type: string
    amount: string
    description?: string
    metadata?: Record<string, unknown>
    createdAt: string
  }>
  total: number
  limit: number
  offset: number
}

export const paymentsApi = {
  initiateTopup: async (amountInPaisa: string) => {
    return httpClient.post<TopupInitResponse>(API_ENDPOINTS.PAYMENTS.WALLET_TOPUP, {
      amountInPaisa,
    })
  },

  confirmTopup: async (sessionId: string) => {
    return httpClient.post<{ topupId: string; paymentIntentId: string; debtDeducted: string; finalAdded: string; alreadyProcessed?: boolean }>(
      API_ENDPOINTS.PAYMENTS.WALLET_TOPUP_CONFIRM,
      { sessionId },
    )
  },

  getWalletBalance: async () => {
    return httpClient.get<WalletBalanceResponse>(API_ENDPOINTS.PAYMENTS.WALLET_BALANCE)
  },

  getWalletTransactions: async (limit: number = 50, offset: number = 0) => {
    return httpClient.get<WalletTransactionsResponse>(API_ENDPOINTS.PAYMENTS.WALLET_TRANSACTIONS, {
      params: { limit, offset },
    })
  },

  getAdminPaymentStats: async () => {
    return httpClient.get<AdminPaymentStatsResponse>(API_ENDPOINTS.PAYMENTS.ADMIN_STATS)
  },

  getAdminDebts: async (status: 'pending' | 'paid' | 'all' = 'pending') => {
    return httpClient.get<DebtListResponse>(API_ENDPOINTS.PAYMENTS.ADMIN_DEBTS, {
      params: { status, limit: 100, offset: 0 },
    })
  },

  getAdminAuditTrail: async () => {
    return httpClient.get<AuditTrailResponse>(API_ENDPOINTS.PAYMENTS.ADMIN_AUDIT_TRAIL, {
      params: { limit: 100, offset: 0 },
    })
  },

  enforceDebt: async (debtId: string) => {
    return httpClient.post<{ enforced: boolean; reason?: string }>(API_ENDPOINTS.PAYMENTS.ADMIN_ENFORCE_DEBT, {
      debtId,
    })
  },

  getDriverEarningsSummary: async () => {
    return httpClient.get<EarningsSummaryResponse>(API_ENDPOINTS.PAYMENTS.DRIVER_EARNINGS_SUMMARY)
  },

  getHotelManagerEarningsSummary: async () => {
    return httpClient.get<EarningsSummaryResponse>(API_ENDPOINTS.PAYMENTS.HOTEL_MANAGER_EARNINGS_SUMMARY)
  },
}
