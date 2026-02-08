'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * This page is no longer needed — car listing is handled via the modal
 * on /driver/cars. Redirect any direct visits there.
 */
export default function NewCarPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/driver/cars')
  }, [router])

  return null
}
