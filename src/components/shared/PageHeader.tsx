'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backUrl?: string
  backLabel?: string
  showBack?: boolean
  action?: React.ReactNode
}

export function PageHeader({ 
  title, 
  subtitle, 
  backUrl, 
  backLabel = 'Back',
  showBack = true,
  action 
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        {showBack && (
          <Button
            variant="outline"
            onClick={handleBack}
            className=""
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Button>
        )}
        {action && <div>{action}</div>}
      </div>
      {title && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
    </div>
  )
}

