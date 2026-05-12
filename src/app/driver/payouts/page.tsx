'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { SimpleChart } from '@/components/shared/SimpleChart'
import { paymentsApi, type EarningsSummaryResponse, type WalletTransaction, type WalletTransactionsResponse } from '@/lib/api/payments.api'

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
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankRoutingNumber, setBankRoutingNumber] = useState('')
  const [bankHolderName, setBankHolderName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe_payout' | 'manual_transfer'>('manual_transfer')
  const [withdrawalEligibility, setWithdrawalEligibility] = useState<any | null>(null)
  const [withdrawalStatus, setWithdrawalStatus] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
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

        const [summaryRes, txRes, eligibilityRes] = await Promise.all([
          paymentsApi.getDriverEarningsSummary(),
          paymentsApi.getWalletTransactions(100, 0),
          paymentsApi.getWithdrawalEligibility(),
        ])
        setSummary(summaryRes)
        setTransactions(txRes)
        setWithdrawalEligibility(eligibilityRes)
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

  const handleInitiateWithdrawal = async () => {
    try {
      setWithdrawing(true)
      setWithdrawalStatus(null)
      setError(null)

      const rupees = Number(withdrawalAmount)
      if (!Number.isFinite(rupees) || rupees <= 0) {
        setError('Enter a valid withdrawal amount in PKR')
        return
      }

      const amountInPaisa = Math.round(rupees * 100)
      const max = Number(withdrawalEligibility?.eligibleForWithdrawal || '0')
      const min = Number(withdrawalEligibility?.minimumWithdrawalAmount || '0')

      if (amountInPaisa < min) {
        setError(`Minimum withdrawal is ${formatPkr(parsePaisa(String(min)))}`)
        return
      }

      if (amountInPaisa > max) {
        setError(`Maximum withdrawable amount is ${formatPkr(parsePaisa(String(max)))}`)
        return
      }

      const response = await paymentsApi.initiateWithdrawal({
        amountInPaisa: String(amountInPaisa),
        bankAccountNumber: bankAccountNumber || undefined,
        bankRoutingNumber: bankRoutingNumber || undefined,
        bankHolderName: bankHolderName || undefined,
        paymentMethod,
      })

      setWithdrawalStatus(response.message || `Withdrawal ${response.status}`)
      setWithdrawalAmount('')

      const [summaryRes, txRes, eligibilityRes] = await Promise.all([
        paymentsApi.getDriverEarningsSummary(),
        paymentsApi.getWalletTransactions(100, 0),
        paymentsApi.getWithdrawalEligibility(),
      ])
      setSummary(summaryRes)
      setTransactions(txRes)
      setWithdrawalEligibility(eligibilityRes)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to initiate withdrawal')
    } finally {
      setWithdrawing(false)
    }
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
      <div className="premium-gradient-bg">
        <PageHeader
          title="Earnings & Payouts"
          subtitle="Track your income and payout history"
          backUrl="/driver/dashboard"
          backLabel="Back to Dashboard"
          centered={true}
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="card-accent-line premium-card">
            <CardContent className="p-4 text-red-700 text-sm" style={{ position: 'relative', zIndex: 1 }}>{error}</CardContent>
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
  const eligibleWithdrawal = parsePaisa(withdrawalEligibility?.eligibleForWithdrawal || '0')
  const minimumWithdrawal = parsePaisa(withdrawalEligibility?.minimumWithdrawalAmount || '0')
  const canWithdraw = Boolean(withdrawalEligibility?.canWithdraw)

  return (
    <div className="premium-gradient-bg">
      <PageHeader
        title="Earnings & Payouts"
        subtitle="Track your income and payout history"
        backUrl="/driver/dashboard"
        backLabel="Back to Dashboard"
        centered={true}
      />
      <div className="container mx-auto px-4 py-8">
        {message && (
          <Card className="card-accent-line premium-card mb-4">
            <CardContent className="p-4 text-blue-700 text-sm" style={{ position: 'relative', zIndex: 1 }}>{message}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="card-accent-line premium-card premium-card-dark-image"><CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-sm">Wallet Balance</CardTitle></CardHeader><CardContent style={{ position: 'relative', zIndex: 1 }}><p className="text-2xl font-bold text-blue-700">{formatPkr(current)}</p></CardContent></Card>
          <Card className="card-accent-line premium-card premium-card-dark-image"><CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-sm">Available</CardTitle></CardHeader><CardContent style={{ position: 'relative', zIndex: 1 }}><p className="text-2xl font-bold text-green-700">{formatPkr(available)}</p></CardContent></Card>
          <Card className="card-accent-line premium-card premium-card-dark-image"><CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-sm">Pending Debt</CardTitle></CardHeader><CardContent style={{ position: 'relative', zIndex: 1 }}><p className="text-2xl font-bold text-red-700">{formatPkr(debtPending)}</p></CardContent></Card>
        </div>

        <Card className="card-accent-line premium-card premium-card-dark-image mb-6">
          <CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-lg">Top Up Wallet</CardTitle></CardHeader>
          <CardContent style={{ position: 'relative', zIndex: 1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TOPUP_OPTIONS.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleTopup(amount)}
                  disabled={topupLoading}
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
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
                  border: '2px solid transparent',
                  borderRadius: '0.375rem'
                }}
                className="w-full md:w-72 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:shadow-lg"
              />
              <Button
                onClick={handleCustomTopup}
                disabled={topupLoading}
                className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white"
              >
                Add Custom Amount
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Secure checkout is handled by Stripe test mode.</p>
          </CardContent>
        </Card>

        <Card className="card-accent-line premium-card premium-card-dark-image mb-6">
          <CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-lg">Withdraw to Bank</CardTitle></CardHeader>
          <CardContent style={{ position: 'relative', zIndex: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
              <div style={{
                background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(8,145,178,0.08))',
                borderRadius: '0.375rem',
                border: '1px solid rgba(45,212,191,0.25)',
                padding: '12px'
              }}>
                <p style={{ color: '#0d9488', fontSize: '12px', margin: '0 0 4px 0' }}>Withdrawable</p>
                <p style={{ fontWeight: 600, color: '#059669', margin: 0 }}>{formatPkr(eligibleWithdrawal)}</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(8,145,178,0.08))',
                borderRadius: '0.375rem',
                border: '1px solid rgba(45,212,191,0.25)',
                padding: '12px'
              }}>
                <p style={{ color: '#0d9488', fontSize: '12px', margin: '0 0 4px 0' }}>Minimum</p>
                <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{formatPkr(minimumWithdrawal)}</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(8,145,178,0.08))',
                borderRadius: '0.375rem',
                border: '1px solid rgba(45,212,191,0.25)',
                padding: '12px'
              }}>
                <p style={{ color: '#0d9488', fontSize: '12px', margin: '0 0 4px 0' }}>Status</p>
                <p style={{ fontWeight: 600, color: canWithdraw ? '#059669' : '#dc2626', margin: 0 }}>
                  {canWithdraw ? 'Eligible' : 'Not eligible'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                min={1}
                step={50}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Withdrawal amount in PKR"
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
                  border: '2px solid transparent',
                  borderRadius: '0.375rem'
                }}
                className="px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:shadow-lg"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'stripe_payout' | 'manual_transfer')}
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
                  border: '2px solid transparent',
                  borderRadius: '0.375rem'
                }}
                className="px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:shadow-lg"
              >
                <option value="manual_transfer">Manual transfer</option>
                <option value="stripe_payout">Stripe payout</option>
              </select>
              <input
                type="text"
                value={bankHolderName}
                onChange={(e) => setBankHolderName(e.target.value)}
                placeholder="Bank account holder name"
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
                  border: '2px solid transparent',
                  borderRadius: '0.375rem'
                }}
                className="px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:shadow-lg"
              />
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Bank account number"
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
                  border: '2px solid transparent',
                  borderRadius: '0.375rem'
                }}
                className="px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:shadow-lg"
              />
              <input
                type="text"
                value={bankRoutingNumber}
                onChange={(e) => setBankRoutingNumber(e.target.value)}
                placeholder="Bank routing number"
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
                  border: '2px solid transparent',
                  borderRadius: '0.375rem'
                }}
                className="px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:shadow-lg"
              />
            </div>

            <Button 
              onClick={handleInitiateWithdrawal} 
              disabled={withdrawing || !canWithdraw}
              className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white"
            >
              {withdrawing ? 'Submitting...' : 'Initiate Withdrawal'}
            </Button>

            {withdrawalStatus && (
              <p className="text-sm text-blue-700 mt-3">{withdrawalStatus}</p>
            )}
          </CardContent>
        </Card>

        {debtPending > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="card-accent-line premium-card mb-6">
              <CardContent className="p-4 text-amber-800 text-sm" style={{ position: 'relative', zIndex: 1 }}>
                You have pending commission debt. New topups automatically settle old debt first.
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-accent-line premium-card premium-card-dark-image">
            <CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-lg">7-Day Earnings Trend</CardTitle></CardHeader>
            <CardContent style={{ position: 'relative', zIndex: 1 }}>
              <SimpleChart data={chartData.length ? chartData : [{ label: 'No Data', value: 0 }]} type="line" height={220} />
            </CardContent>
          </Card>
          <Card className="card-accent-line premium-card premium-card-dark-image">
            <CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-lg">Transaction Type Breakdown</CardTitle></CardHeader>
            <CardContent style={{ position: 'relative', zIndex: 1 }}>
              <SimpleChart data={typeBreakdown.length ? typeBreakdown : [{ label: 'No Data', value: 0 }]} type="bar" height={220} />
            </CardContent>
          </Card>
        </div>

        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(21,94,117,0.15)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Gradient Header Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #1e40af, #0891b2, #0d9488)',
            padding: '18px 24px',
            borderTop: '2px solid rgba(45,212,191,0.6)',
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0, letterSpacing: '0.3px' }}>
              Recent Wallet Transactions
            </h2>
          </div>

          {/* Table Container */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(45,212,191,0.2)',
            borderTop: 'none',
          }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                </colgroup>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(to right, rgba(45,212,191,0.08), rgba(8,145,178,0.08))',
                    borderBottom: '1px solid rgba(45,212,191,0.25)'
                  }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#0d9488', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', borderRight: '2px solid rgba(45,212,191,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Type</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#0d9488', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', borderRight: '2px solid rgba(45,212,191,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Details</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#0d9488', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', borderRight: '2px solid rgba(45,212,191,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Amount</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#0d9488', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => {
                    const amount = parsePaisa(tx.amount)
                    const typeLabel = tx.type.replace(/_/g, ' ').charAt(0).toUpperCase() + tx.type.replace(/_/g, ' ').slice(1).toLowerCase()
                    const isPositive = amount >= 0

                    return (
                      <tr
                        key={tx.id}
                        style={{
                          borderBottom: '1px solid rgba(45,212,191,0.12)',
                          height: '44px'
                        }}
                      >
                        <td style={{ padding: '8px 12px', textAlign: 'left', color: '#111827', fontWeight: 500, borderRight: '2px solid rgba(45,212,191,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {typeLabel}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'left', color: '#111827', fontWeight: 500, borderRight: '2px solid rgba(45,212,191,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getTxDetails(tx)}
                        </td>
                        <td style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          color: isPositive ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                          borderRight: '2px solid rgba(45,212,191,0.6)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {isPositive ? '+' : '-'}{formatPkr(Math.abs(amount))}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
      </div>
    </div>
  )
}
