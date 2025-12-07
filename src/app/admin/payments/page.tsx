'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { usePaymentsAdmin } from '@/features/admin/usePaymentsAdmin'

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'>('all')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })
  
  const { payments, isLoading, processRefund } = usePaymentsAdmin()

  const filteredPayments = payments?.filter((payment: any) => {
    const matchesSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesDateRange = !dateRange.startDate || !dateRange.endDate || 
                            (new Date(payment.createdAt) >= new Date(dateRange.startDate) &&
                             new Date(payment.createdAt) <= new Date(dateRange.endDate))
    return matchesSearch && matchesStatus && matchesDateRange
  }) || []

  const handleRefund = async (paymentId: string) => {
    if (confirm('Are you sure you want to process a refund for this payment?')) {
      try {
        await processRefund(paymentId)
      } catch (error) {
        console.error('Failed to process refund:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalRevenue = payments?.filter((p: any) => p.status === 'COMPLETED').reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const totalRefunds = payments?.filter((p: any) => p.status === 'REFUNDED').reduce((sum: number, p: any) => sum + (p.refundAmount || 0), 0) || 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="Payment Management"
          subtitle="Monitor and manage payment transactions"
          backUrl="/admin/dashboard"
          backLabel="Back to Dashboard"
        />
        <PageLoader message="Loading payments..." variant="skeleton" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Payment Management"
        subtitle="Monitor and manage payment transactions"
        backUrl="/admin/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Management
        </h1>
        <p className="text-lg text-gray-600">
          Monitor and manage all payment transactions on the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Search Payments"
          placeholder="Search by ID or booking..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <Input
          label="Start Date"
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <Input
          label="End Date"
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-100/90">Total Payments</p>
                  <p className="text-3xl font-bold text-white">{payments?.length || 0}</p>
                </div>
                <div className="text-4xl">💳</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-100/90">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-100/90">Pending Payments</p>
                  <p className="text-3xl font-bold text-white">
                    {payments?.filter((p: any) => p.status === 'PENDING').length || 0}
                  </p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-100/90">Total Refunds</p>
                  <p className="text-3xl font-bold text-white">${totalRefunds.toLocaleString()}</p>
                </div>
                <div className="text-4xl">🔄</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payments List */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
        <Card className="shadow-lg bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900">Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="space-y-4">
              {filteredPayments.map((payment: any) => (
                <div key={payment.id} className="rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500">
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium">#{payment.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Booking ID:</span> {payment.bookingId}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {payment.bookingType}
                      </div>
                      <div>
                        <span className="font-medium">Method:</span> {payment.method}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {formatDate(payment.createdAt)}
                      </div>
                    </div>
                    {payment.transactionId && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Transaction ID:</span> {payment.transactionId}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="font-semibold text-lg">${payment.amount}</div>
                    {payment.refundAmount && (
                      <div className="text-sm text-red-600">Refunded: ${payment.refundAmount}</div>
                    )}
                    {payment.status === 'COMPLETED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-red-600 hover:text-red-700"
                        onClick={() => handleRefund(payment.id)}
                      >
                        Process Refund
                      </Button>
                    )}
                  </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">💳</div>
              <p>No payments found</p>
              <p className="text-sm">No payments match your search criteria</p>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
