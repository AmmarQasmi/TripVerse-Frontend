'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { usePaymentsAdmin } from '@/features/admin/usePaymentsAdmin'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const parsePaisa = (value: string) => Number(value) / 100
const formatPkr = (value: number) =>
  `PKR ${value.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`

const CHART_COLORS = ['#0f766e', '#1d4ed8', '#0ea5e9', '#d97706']

export default function AdminPaymentsPage() {
  const { stats, debts, auditTrail, isLoading, enforceDebt } = usePaymentsAdmin()
  const [auditPage, setAuditPage] = useState(1)
  const auditPageSize = 6

  const commissionPieData = useMemo(() => {
    const platform = parsePaisa(stats?.financialTotals?.platformCommissionCollected || '0')
    const tax = parsePaisa(stats?.financialTotals?.taxReserveCollected || '0')
    return [
      { name: 'Platform', value: platform },
      { name: 'Tax Reserve', value: tax },
    ]
  }, [stats])

  const revenueTrend = useMemo(() => {
    if (stats?.revenueTrend && stats.revenueTrend.length > 0) {
      return stats.revenueTrend.map((row) => ({
        day: row.day.slice(5),
        amount: Math.round(parsePaisa(row.amount)),
      }))
    }

    const byDay: Record<string, number> = {}
    ;(auditTrail || []).forEach((row) => {
      const d = new Date(row.createdAt)
      const key = `${d.getMonth() + 1}/${d.getDate()}`
      byDay[key] = (byDay[key] || 0) + Math.abs(parsePaisa(row.amount))
    })
    return Object.entries(byDay)
      .slice(-10)
      .map(([day, amount]) => ({ day, amount: Math.round(amount) }))
  }, [auditTrail, stats?.revenueTrend])

  const txTypeData = useMemo(() => {
    if (stats?.transactionTypeBreakdown && stats.transactionTypeBreakdown.length > 0) {
      return stats.transactionTypeBreakdown.map((row) => ({
        type: row.type.replace(/_/g, ' '),
        value: Math.round(parsePaisa(row.amount)),
      }))
    }

    const agg: Record<string, number> = {}
    ;(auditTrail || []).forEach((row) => {
      agg[row.type] = (agg[row.type] || 0) + Math.abs(parsePaisa(row.amount))
    })
    return Object.entries(agg).map(([type, value]) => ({ type, value: Math.round(value) }))
  }, [auditTrail, stats?.transactionTypeBreakdown])

  const paginatedAudit = useMemo(() => {
    const start = (auditPage - 1) * auditPageSize
    return auditTrail.slice(start, start + auditPageSize)
  }, [auditTrail, auditPage])

  const auditTotalPages = Math.max(1, Math.ceil(auditTrail.length / auditPageSize))

  if (isLoading) {
    return <PageLoader message="Loading payments dashboard..." variant="skeleton" />
  }

  const commissionWalletTotal = parsePaisa(stats?.financialTotals?.commissionWalletTotal || '0')
  const totalCommission = parsePaisa(stats?.financialTotals?.platformCommissionCollected || '0')
  const totalTaxReserve = parsePaisa(stats?.financialTotals?.taxReserveCollected || '0')
  const outstandingDebt = parsePaisa(stats?.financialTotals?.outstandingDebt || stats?.debtStats.totalPending || '0')
  const topupProcessed = parsePaisa(stats?.financialTotals?.topupProcessed || stats?.topupStats?.completedAmount || '0')

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Payments Command Center"
        subtitle="Commission, tax reserve, debt controls, and full wallet audit"
        backUrl="/admin/dashboard"
        backLabel="Back to Dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <Card><CardHeader><CardTitle className="text-sm">Commission Wallet (15%)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-sky-700">{formatPkr(commissionWalletTotal)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Tax Share (8.5%)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-teal-700">{formatPkr(totalTaxReserve)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Platform Share (6.5%)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-cyan-700">{formatPkr(totalCommission)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Outstanding Debts</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-700">{formatPkr(outstandingDebt)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Topups Processed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-indigo-700">{formatPkr(topupProcessed)}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Commission Split</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={commissionPieData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {commissionPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Daily Revenue Trend</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Transactions by Type</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txTypeData}>
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Debt Queue</CardTitle></CardHeader>
            <CardContent className="max-h-[280px] overflow-auto">
              <div className="space-y-3">
                {debts.slice(0, 8).map((debt) => (
                  <div key={debt.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{debt.driverName}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(debt.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPkr(parsePaisa(debt.amount))}</p>
                        <button
                          onClick={() => enforceDebt(debt.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Enforce
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!debts.length && <p className="text-sm text-gray-500">No pending debts.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Wallet Audit Trail</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">User</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAudit.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="py-2">{row.userName}</td>
                      <td className="py-2 capitalize">{row.type.replace(/_/g, ' ')}</td>
                      <td className="py-2 font-medium">{formatPkr(Math.abs(parsePaisa(row.amount)))}</td>
                      <td className="py-2 text-gray-600">{new Date(row.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Showing {(auditPage - 1) * auditPageSize + (paginatedAudit.length ? 1 : 0)}-
                {(auditPage - 1) * auditPageSize + paginatedAudit.length} of {auditTrail.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAuditPage((prev) => Math.max(1, prev - 1))}
                  disabled={auditPage === 1}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-600">Page {auditPage} of {auditTotalPages}</span>
                <button
                  type="button"
                  onClick={() => setAuditPage((prev) => Math.min(auditTotalPages, prev + 1))}
                  disabled={auditPage >= auditTotalPages}
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
