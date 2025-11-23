'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DashboardHeader } from './DashboardHeader'

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
    <>
      <DashboardHeader title={title} subtitle={subtitle} />
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {showBack && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          )}
          {action && <div>{action}</div>}
        </div>
      </div>
    </>
  )
}

