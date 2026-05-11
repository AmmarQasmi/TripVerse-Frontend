import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ReactNode } from 'react'

interface AlertCardProps {
  icon: ReactNode
  title: string
  value: number
  description: string
  actionLabel: string
  actionHref: string
  bgColor: string
}

export function AlertCard({
  icon,
  title,
  value,
  description,
  actionLabel,
  actionHref,
  bgColor,
}: AlertCardProps) {
  return (
    <div
      className={`${bgColor} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200`}
      role="article"
      aria-label={`${title}: ${value} ${description}`}
    >
      <div className="flex flex-col space-y-4 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10" aria-hidden="true">
              {icon}
            </div>
            <h3 className="font-semibold text-white text-lg leading-tight">
              {title}
            </h3>
          </div>
          <div className="text-3xl font-bold text-white whitespace-nowrap ml-4">
            {value.toLocaleString()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/20">
          <p className="text-sm text-white/80">{description}</p>
          <Link href={actionHref} className="ml-3">
            <Button
              size="sm"
              className="bg-white/95 text-gray-900 hover:bg-white font-medium transition-colors"
              aria-label={`${actionLabel} - ${title}`}
            >
              {actionLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
