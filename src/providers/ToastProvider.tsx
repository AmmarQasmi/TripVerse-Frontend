'use client'

import { ToastProvider } from '@/components/ui/Toast'

export function ClientToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

