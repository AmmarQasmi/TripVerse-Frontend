'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { SimpleChart } from '@/components/shared/SimpleChart'
import { paymentsApi, type EarningsSummaryResponse, type WalletTransactionsResponse } from '@/lib/api/payments.api'

const parsePaisa = (value: string) => Number(value) / 100

const formatPkr = (value: number) =>
  `PKR ${value.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`

const TOPUP_OPTIONS = [50000, 100000, 200000]

export default function DriverPayoutsPage() {
  const params = useSearchParams()
  const topupStatus = params.get('topup')
  const sessionId = params.get('session_id')

  const [summary, setSummary] = useState<EarningsSummaryResponse | null>(null)
  const [transactions, setTransactions] = useState<WalletTransactionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [topupLoading, setTopupLoading] = useState(false)
  const [customTopup, setCustomTopup] = useState('')
  const [txPage, setTxPage] = useState(1)
  const txPageSize = 6

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

        const [summaryRes, txRes] = await Promise.all([
          paymentsApi.getDriverEarningsSummary(),
          paymentsApi.getWalletTransactions(100, 0),
        ])
        setSummary(summaryRes)
        setTransactions(txRes)
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load payouts data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId, topupStatus])

  const handleTopup = async (amountInPaisa: number) => {
    try {
      setTopupLoading(true)
      const response = await paymentsApi.initiateTopup(String(amountInPaisa))
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
        return
      }
      setError('Unable to start topup checkout.')
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to start topup')
    } finally {
      setTopupLoading(false)
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

  const chartData = useMemo(() => {
    const tx = transactions?.transactions || []
    const byDay: Record<string, number> = {}

    tx.forEach((item) => {
      if (item.type !== 'commission') return
      const d = new Date(item.createdAt)
      const key = `${d.getMonth() + 1}/${d.getDate()}`
      const amount = Math.max(0, parsePaisa(item.amount))
      byDay[key] = (byDay[key] || 0) + amount
    })

    return Object.entries(byDay)
      .slice(-7)
      .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }))
  }, [transactions])

  const typeBreakdown = useMemo(() => {
    const tx = transactions?.transactions || []
    const agg: Record<string, number> = {
      commission: 0,
      topup: 0,
      refund: 0,
      deduction: 0,
      debt_repayment: 0,
      tax_reserve: 0,
    }
    tx.forEach((item) => {
      const key = item.type
      if (!(key in agg)) {
        agg[key] = 0
      }
      agg[key] += Math.abs(parsePaisa(item.amount))
    })
    return Object.entries(agg).map(([label, value]) => ({
      label,
      value: Number(value.toFixed(2)),
    }))
  }, [transactions])

  const paginatedTransactions = useMemo(() => {
    const start = (txPage - 1) * txPageSize
    const txList = transactions?.transactions || []
    return txList.slice(start, start + txPageSize)
  }, [transactions, txPage])

  const txTotalPages = Math.max(1, Math.ceil(((transactions?.transactions || []).length) / txPageSize))

  if (loading) {
    return <PageLoader message="Loading payouts dashboard..." variant="skeleton" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Earnings & Payouts"
          subtitle="Track your income and payout history"
          backUrl="/driver/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-700">{error}</CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const available = parsePaisa(summary?.balance.available || '0')
  const current = parsePaisa(summary?.balance.current || '0')
  const debtPending = parsePaisa(summary?.debts.pending || '0')
  const totalEarned = parsePaisa(summary?.earnings.fromTrips || summary?.earnings.total || '0')
  const totalTopups = parsePaisa(summary?.earnings.topups || '0')

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Earnings & Payouts"
        subtitle="Track your income and payout history"
        backUrl="/driver/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card><CardHeader><CardTitle className="text-sm">Wallet Balance</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-700">{formatPkr(current)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Available</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-blue-700">{formatPkr(available)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Pending Debt</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-700">{formatPkr(debtPending)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Total Earned</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-purple-700">{formatPkr(totalEarned)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Topups Added</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-indigo-700">{formatPkr(totalTopups)}</p></CardContent></Card>
        </div>

        {message && (
          <Card className="border-green-200 bg-green-50 mb-4">
            <CardContent className="p-4 text-green-700 text-sm">{message}</CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Top Up Wallet</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {TOPUP_OPTIONS.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleTopup(amount)}
                  disabled={topupLoading}
                >
                  {topupLoading ? 'Processing...' : `Add PKR ${(amount / 100).toLocaleString()}`}
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
              <Button onClick={handleCustomTopup} disabled={topupLoading}>
                {topupLoading ? 'Processing...' : 'Add Custom Amount'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Topups can be used to settle pending debt and keep your account in good standing.
            </p>
          </CardContent>
        </Card>

        {debtPending > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-amber-300 bg-amber-50 mb-6">
              <CardContent className="p-4 text-amber-800 text-sm">
                You have pending commission debt. New topups automatically settle old debt first.
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">7-Day Earnings Trend</CardTitle></CardHeader>
            <CardContent>
              <SimpleChart data={chartData.length ? chartData : [{ label: 'No Data', value: 0 }]} type="line" height={220} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Transaction Type Breakdown</CardTitle></CardHeader>
            <CardContent>
              <SimpleChart data={typeBreakdown.length ? typeBreakdown : [{ label: 'No Data', value: 0 }]} type="bar" height={220} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Wallet Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Type</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => {
                    const value = parsePaisa(tx.amount)
                    const positive = value >= 0
                    return (
                      <tr key={tx.id} className="border-b last:border-b-0">
                        <td className="py-2 capitalize">{tx.type.replace(/_/g, ' ')}</td>
                        <td className={`py-2 font-medium ${positive ? 'text-green-700' : 'text-red-700'}`}>
                          {positive ? '+' : '-'}{formatPkr(Math.abs(value))}
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
