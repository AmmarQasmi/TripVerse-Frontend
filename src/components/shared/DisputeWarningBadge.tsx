'use client'

interface DisputeWarningBadgeProps {
  disputeCount: number
  warningSent: boolean
}

export function DisputeWarningBadge({ disputeCount, warningSent }: DisputeWarningBadgeProps) {
  if (disputeCount < 3 || !warningSent) {
    return null
  }

  return (
    <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500 rounded-lg px-3 py-1">
      <span className="text-lg">⚠️</span>
      <span className="text-orange-200 text-sm font-medium">
        {disputeCount} Dispute{disputeCount !== 1 ? 's' : ''} - Warning Issued
      </span>
    </div>
  )
}

