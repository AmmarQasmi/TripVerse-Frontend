'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { DriverSuspensionStatus } from '@/lib/api/drivers.api'

interface SuspensionStatusCardProps {
  status: DriverSuspensionStatus
}

export function SuspensionStatusCard({ status }: SuspensionStatusCardProps) {
  if (!status.is_suspended && !status.is_banned && !status.warning_sent) {
    return null
  }

  const getStatusColor = () => {
    if (status.is_banned) return 'bg-red-500/20 border-red-500'
    if (status.is_suspended) return 'bg-yellow-500/20 border-yellow-500'
    if (status.warning_sent) return 'bg-orange-500/20 border-orange-500'
    return 'bg-gray-500/20 border-gray-500'
  }

  const getStatusIcon = () => {
    if (status.is_banned) return '🚫'
    if (status.is_suspended) return '⏸️'
    if (status.warning_sent) return '⚠️'
    return '📋'
  }

  const getStatusText = () => {
    if (status.is_banned) return 'Account Banned'
    if (status.is_suspended && status.is_paused) return 'Suspension Paused (Active Ride)'
    if (status.is_suspended) return 'Account Suspended'
    if (status.warning_sent) return 'Dispute Warning'
    return 'Status Unknown'
  }

  return (
    <Card className={`${getStatusColor()} border-2 backdrop-blur-md shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">{getStatusIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg mb-2">{getStatusText()}</h3>
            {status.dispute_count > 0 && (
              <p className="text-gray-200 text-sm mb-2">
                You have {status.dispute_count} dispute{status.dispute_count !== 1 ? 's' : ''} in the current tracking period.
              </p>
            )}
            {status.is_paused && status.pause_reason && (
              <p className="text-gray-200 text-sm mb-2">
                Your suspension is paused due to an active ride. It will resume after your trip completes.
              </p>
            )}
            {status.suspension_end_date && !status.is_banned && (
              <p className="text-gray-200 text-sm">
                Suspension ends: {new Date(status.suspension_end_date).toLocaleDateString()}
              </p>
            )}
            {status.warning_sent && !status.is_suspended && !status.is_banned && (
              <p className="text-gray-200 text-sm">
                You have received a warning. Please improve your service quality to avoid suspension.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

