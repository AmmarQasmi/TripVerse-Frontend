'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { adminApi } from '@/lib/api/admin.api'

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

export default function ClientDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await adminApi.getMyDisputes({ limit: 100 })
        setDisputes(response?.data || [])
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load your complaints')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <PageLoader message="Loading your complaints..." variant="skeleton" />
  }

  return (
    <div className="premium-gradient-bg">
      <PageHeader
        title="My Complaints"
        subtitle="Track status, fines, and resolution updates"
        backUrl="/client/dashboard"
        backLabel="Back to Dashboard"
        centered={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-end mb-6">
          <Link href="/client/disputes/new">
            <Button>File New Complaint</Button>
          </Link>
        </div>

        {error && (
          <Card className="card-accent-line premium-card activity-log-border mb-6">
            <CardContent className="p-4 text-red-700 text-sm" style={{ position: 'relative', zIndex: 1 }}>{error}</CardContent>
          </Card>
        )}

        {!error && disputes.length === 0 && (
          <Card className="card-accent-line premium-card activity-log-border mb-6">
            <CardContent className="p-8 text-center text-gray-600" style={{ position: 'relative', zIndex: 1 }}>
              You have not filed any complaints yet.
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {disputes.map((dispute: any) => (
            <Card key={dispute.id} className="card-accent-line premium-card premium-card-dark-image activity-log-border">
            <CardHeader style={{ position: 'relative', zIndex: 1 }}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base">Complaint #{dispute.id}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[dispute.status] || 'bg-gray-100 text-gray-700'}`}>
                  {String(dispute.status || 'pending').toUpperCase()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm" style={{ position: 'relative', zIndex: 1 }}>
              <p className="text-gray-700">{dispute.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 pt-2">
                <p>
                  <span className="font-medium">Booking:</span> #{dispute.booking?.id || dispute.booking_car_id || dispute.booking_hotel_id}
                </p>
                <p>
                  <span className="font-medium">Filed:</span> {formatDate(dispute.created_at)}
                </p>
                <p>
                  <span className="font-medium">Resolved:</span> {formatDate(dispute.resolved_at)}
                </p>
                <p>
                  <span className="font-medium">Fine / Refund:</span> PKR {Number(dispute.fine_amount || 0).toLocaleString()}
                </p>
              </div>

              {dispute.booking?.financials?.driver_earnings !== undefined && (
                <p className="text-gray-600">
                  <span className="font-medium">Ride driver earnings:</span> PKR {Number(dispute.booking.financials.driver_earnings).toLocaleString()}
                </p>
              )}

              {dispute.resolution && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 mt-3">
                  <p className="text-xs font-medium text-green-700 mb-2">Resolution</p>
                  <p className="text-sm text-green-800">{dispute.resolution}</p>
                </div>
              )}
            </CardContent>
          </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
