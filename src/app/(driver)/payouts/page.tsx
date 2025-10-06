'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useDriverPayouts } from '@/features/drivers/useDriverPayouts'

export default function DriverPayoutsPage() {
  const [requestAmount, setRequestAmount] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  
  const { data: payouts, isLoading, requestPayout } = useDriverPayouts()

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestAmount || parseFloat(requestAmount) <= 0) return
    
    setIsRequesting(true)
    try {
      await requestPayout(parseFloat(requestAmount))
      setRequestAmount('')
    } catch (error) {
      console.error('Failed to request payout:', error)
    } finally {
      setIsRequesting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Mock data for available balance and earnings
  const availableBalance = 1250.50
  const totalEarnings = 3240.75
  const pendingPayouts = 150.25

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payouts & Earnings
        </h1>
        <p className="text-lg text-gray-600">
          Track your earnings and request payouts from your car rental income.
        </p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">${availableBalance}</p>
                <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${totalEarnings}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">${pendingPayouts}</p>
                <p className="text-xs text-gray-500 mt-1">In processing</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Payout */}
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayoutRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Balance: ${availableBalance}
                </label>
                <Input
                  label="Payout Amount"
                  type="number"
                  min="10"
                  max={availableBalance}
                  step="0.01"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum withdrawal: $10.00
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Payout Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Payouts are processed within 2-3 business days</p>
                  <p>• Funds will be transferred to your registered bank account</p>
                  <p>• A 2.9% processing fee applies to all payouts</p>
                  <p>• You can track payout status in the history below</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isRequesting || !requestAmount || parseFloat(requestAmount) < 10}
              >
                {isRequesting ? 'Processing...' : 'Request Payout'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Primary Bank Account</h4>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  **** **** **** 1234
                </p>
                <p className="text-sm text-gray-600">
                  Chase Bank • Checking Account
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Verified
                </span>
              </div>

              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-gray-500 mb-2">+</div>
                <Button variant="outline" className="w-full">
                  Add Bank Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : payouts && payouts.length > 0 ? (
            <div className="space-y-4">
              {payouts.map((payout: any) => (
                <div key={payout.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">#{payout.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested on {formatDate(payout.createdAt)}
                    </p>
                    {payout.processedAt && (
                      <p className="text-sm text-gray-600">
                        Processed on {formatDate(payout.processedAt)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${payout.amount}</p>
                    {payout.fee && (
                      <p className="text-sm text-gray-600">Fee: ${payout.fee}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">💳</div>
              <p>No payout history yet</p>
              <p className="text-sm">Your payout requests will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
