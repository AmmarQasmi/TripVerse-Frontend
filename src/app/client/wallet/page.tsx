'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { paymentsApi, type WalletBalanceResponse, type WalletTransaction, type WalletTransactionsResponse } from '@/lib/api/payments.api'

const parsePaisa = (value: string) => Number(value) / 100
const formatPkr = (value: number) =>
  `PKR ${value.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`

const getTxDetails = (tx: WalletTransaction) => {
  if (tx.description && tx.description.trim().length > 0) {
    return tx.description
  }

  const metadata = (tx.metadata || {}) as Record<string, unknown>
  const bookingId = typeof metadata.bookingId === 'number' || typeof metadata.bookingId === 'string'
    ? String(metadata.bookingId)
    : null
  const debtId = typeof metadata.debtId === 'string' ? metadata.debtId : null

  if (bookingId) {
    return `Booking #${bookingId}`
  }
  if (debtId) {
    return `Debt reference ${debtId}`
  }

  return 'Wallet adjustment'
}

const TOPUP_OPTIONS = [50000, 100000, 200000, 500000]

export default function ClientWalletPage() {
  const params = useSearchParams()
  const [balance, setBalance] = useState<WalletBalanceResponse | null>(null)
  const [transactions, setTransactions] = useState<WalletTransactionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [customTopup, setCustomTopup] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [txPage, setTxPage] = useState(1)
  const txPageSize = 6

  const sessionId = params.get('session_id')
  const topupStatus = params.get('topup')

  const fetchData = async () => {
    const [balanceRes, txRes] = await Promise.all([
      paymentsApi.getWalletBalance(),
      paymentsApi.getWalletTransactions(50, 0),
    ])
    setBalance(balanceRes)
    setTransactions(txRes)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        if (topupStatus === 'success' && sessionId) {
          const key = `topup_confirmed_${sessionId}`
          const alreadyConfirmed = typeof window !== 'undefined' && window.sessionStorage.getItem(key) === '1'

          if (!alreadyConfirmed) {
            const response = await paymentsApi.confirmTopup(sessionId)
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem(key, '1')
            }
            if (response.alreadyProcessed) {
              setMessage('Topup confirmed. Wallet has been updated.')
            } else {
              setMessage('Topup successful. Wallet has been updated.')
            }
          } else {
            setMessage('Topup confirmed. Wallet is up to date.')
          }

          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('topup')
            url.searchParams.delete('session_id')
            window.history.replaceState({}, '', url.toString())
          }
        }

        if (topupStatus === 'cancelled') {
          setMessage('Topup was cancelled.')
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('topup')
            window.history.replaceState({}, '', url.toString())
          }
        }

        await fetchData()
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load wallet')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId, topupStatus])

  const totalIn = useMemo(() => {
    return (transactions?.transactions || [])
      .filter((tx) => Number(tx.amount) > 0)
      .reduce((sum, tx) => sum + parsePaisa(tx.amount), 0)
  }, [transactions])

  const totalOut = useMemo(() => {
    return (transactions?.transactions || [])
      .filter((tx) => Number(tx.amount) < 0)
      .reduce((sum, tx) => sum + Math.abs(parsePaisa(tx.amount)), 0)
  }, [transactions])

  const paginatedTransactions = useMemo(() => {
    const start = (txPage - 1) * txPageSize
    const txList = transactions?.transactions || []
    return txList.slice(start, start + txPageSize)
  }, [transactions, txPage])

  const txTotalPages = Math.max(1, Math.ceil(((transactions?.transactions || []).length) / txPageSize))

  const handleTopup = async (amountInPaisa: number) => {
    try {
      setProcessing(true)
      setError(null)
      const response = await paymentsApi.initiateTopup(String(amountInPaisa))
      if (!response.checkoutUrl) {
        throw new Error('Checkout URL not received from server')
      }
      window.location.href = response.checkoutUrl
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to start topup')
      setProcessing(false)
    }
  }

  const handleCustomTopup = async () => {
    const amountInRupees = Number(customTopup)
    if (!Number.isFinite(amountInRupees) || amountInRupees < 150) {
      setError('Enter a valid custom amount of at least PKR 150')
      return
    }
    await handleTopup(Math.round(amountInRupees * 100))
  }

  if (loading) {
    return <PageLoader message="Loading wallet..." variant="skeleton" />
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Wallet"
        subtitle="Top up balance and monitor all wallet activity"
        backUrl="/client/dashboard"
        backLabel="Back to Dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        {message && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-blue-700 text-sm">{message}</CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><CardHeader><CardTitle className="text-sm">Current Balance</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-blue-700">{formatPkr(parsePaisa(balance?.balance || '0'))}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Total Credits</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-700">{formatPkr(totalIn)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Total Debits</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-700">{formatPkr(totalOut)}</p></CardContent></Card>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Top Up Wallet</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TOPUP_OPTIONS.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleTopup(amount)}
                  disabled={processing}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                >
                  {formatPkr(amount / 100)}
                </Button>
              ))}
            </div>
            <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center">
              <input
                type="number"
                min={150}
                step={50}
                value={customTopup}
                onChange={(e) => setCustomTopup(e.target.value)}
                placeholder="Custom amount in PKR"
                className="w-full md:w-72 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleCustomTopup}
                disabled={processing}
                className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white"
              >
                Add Custom Amount
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Secure checkout is handled by Stripe test mode.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Activity Log</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Type</th>
                    <th className="py-2">Details</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => {
                    const amount = parsePaisa(tx.amount)
                    return (
                      <tr key={tx.id} className="border-b last:border-b-0">
                        <td className="py-2 capitalize">{tx.type.replace(/_/g, ' ')}</td>
                        <td className="py-2 text-gray-700">{getTxDetails(tx)}</td>
                        <td className={`py-2 font-semibold ${amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {amount >= 0 ? '+' : '-'}{formatPkr(Math.abs(amount))}
                        </td>
                        <td className="py-2 text-gray-600">{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Showing {(txPage - 1) * txPageSize + (paginatedTransactions.length ? 1 : 0)}-
                {(txPage - 1) * txPageSize + paginatedTransactions.length} of {transactions?.transactions?.length || 0}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTxPage((prev) => Math.max(1, prev - 1))}
                  disabled={txPage === 1}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-600">Page {txPage} of {txTotalPages}</span>
                <button
                  type="button"
                  onClick={() => setTxPage((prev) => Math.min(txTotalPages, prev + 1))}
                  disabled={txPage >= txTotalPages}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
