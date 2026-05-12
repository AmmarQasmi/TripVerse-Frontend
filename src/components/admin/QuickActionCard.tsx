import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface QuickActionCardProps {
  icon: ReactNode
  title: string
  description: string
  href: string
  delay?: number
}

export function QuickActionCard({
  icon,
  title,
  description,
  href,
  delay = 0,
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Link href={href} className="h-full block">
        <div className="h-full rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-colors duration-200 bg-white hover:shadow-lg">
          <Card className="h-full bg-white rounded-[calc(0.75rem-2px)] flex flex-col border-0">
            <CardContent className="p-6 text-center flex flex-col justify-between h-full gap-4">
              <div className="flex justify-center">
                <div className="w-10 h-10" aria-hidden="true">
                  {icon}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">{description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Link>
    </motion.div>
  )
}
