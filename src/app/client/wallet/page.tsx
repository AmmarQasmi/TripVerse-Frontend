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
    <div className="premium-gradient-bg">
      <PageHeader
        title="Wallet"
        subtitle="Top up balance and monitor all wallet activity"
        backUrl="/client/dashboard"
        backLabel="Back to Dashboard"
        centered={true}
      />

      <div className="container mx-auto px-4 py-8">
        {message && (
          <Card className="card-accent-line premium-card mb-4">
            <CardContent className="p-4 text-blue-700 text-sm" style={{ position: 'relative', zIndex: 1 }}>{message}</CardContent>
          </Card>
        )}

        {error && (
          <Card className="card-accent-line premium-card mb-4">
            <CardContent className="p-4 text-red-700 text-sm" style={{ position: 'relative', zIndex: 1 }}>{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="card-accent-line premium-card premium-card-dark-image"><CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-sm">Current Balance</CardTitle></CardHeader><CardContent style={{ position: 'relative', zIndex: 1 }}><p className="text-2xl font-bold text-blue-700">{formatPkr(parsePaisa(balance?.balance || '0'))}</p></CardContent></Card>
          <Card className="card-accent-line premium-card premium-card-dark-image"><CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-sm">Total Credits</CardTitle></CardHeader><CardContent style={{ position: 'relative', zIndex: 1 }}><p className="text-2xl font-bold text-green-700">{formatPkr(totalIn)}</p></CardContent></Card>
          <Card className="card-accent-line premium-card premium-card-dark-image"><CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-sm">Total Debits</CardTitle></CardHeader><CardContent style={{ position: 'relative', zIndex: 1 }}><p className="text-2xl font-bold text-red-700">{formatPkr(totalOut)}</p></CardContent></Card>
        </div>

        <Card className="card-accent-line premium-card premium-card-dark-image mb-6">
          <CardHeader style={{ position: 'relative', zIndex: 1 }}><CardTitle className="text-lg">Top Up Wallet</CardTitle></CardHeader>
          <CardContent style={{ position: 'relative', zIndex: 1 }}>
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
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
                  border: '2px solid transparent',
                  borderRadius: '0.375rem'
                }}
                className="w-full md:w-72 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:shadow-lg"
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
              Activity Log
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
                    const isRefundOrTopup = tx.type === 'REFUND' || tx.type === 'TOPUP'
                    const isDeduction = tx.type === 'DEDUCTION'

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
                          color: amount >= 0 ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                          fontVariantNumeric: 'tabular-nums',
                          borderRight: '2px solid rgba(45,212,191,0.6)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {amount >= 0 ? '+' : '−'}{formatPkr(Math.abs(amount))}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderTop: '1px solid rgba(45,212,191,0.2)',
              gap: '12px'
            }}>
              <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, margin: 0 }}>
                Showing {(txPage - 1) * txPageSize + (paginatedTransactions.length ? 1 : 0)}-
                {(txPage - 1) * txPageSize + paginatedTransactions.length} of {transactions?.transactions?.length || 0}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTxPage((prev) => Math.max(1, prev - 1))}
                  disabled={txPage === 1}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: `1px solid ${txPage === 1 ? '#d1d5db' : '#0d9488'}`,
                    background: txPage === 1 ? '#F3F4F6' : 'linear-gradient(135deg, #0d9488, #0891b2)',
                    color: txPage === 1 ? '#9CA3AF' : '#FFFFFF',
                    cursor: txPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: txPage === 1 ? 0.5 : 1,
                    fontWeight: 500
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '12px', color: '#111827', fontWeight: 600 }}>
                  Page {txPage} of {txTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setTxPage((prev) => Math.min(txTotalPages, prev + 1))}
                  disabled={txPage >= txTotalPages}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: `1px solid ${txPage >= txTotalPages ? '#d1d5db' : '#0d9488'}`,
                    background: txPage >= txTotalPages ? '#F3F4F6' : 'linear-gradient(135deg, #0d9488, #0891b2)',
                    color: txPage >= txTotalPages ? '#9CA3AF' : '#FFFFFF',
                    cursor: txPage >= txTotalPages ? 'not-allowed' : 'pointer',
                    opacity: txPage >= txTotalPages ? 0.5 : 1,
                    fontWeight: 500
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
