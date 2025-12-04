import type { ReactNode } from 'react'
import { Footer } from '@/components/landing/Footer'

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}


