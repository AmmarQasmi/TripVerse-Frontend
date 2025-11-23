'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { ProfileForm } from '@/components/shared/ProfileForm'
import { PasswordChangeForm } from '@/components/shared/PasswordChangeForm'
import { EmailChangeForm } from '@/components/shared/EmailChangeForm'
import { usersApi, UserProfile } from '@/lib/api/users.api'
import { useAuth } from '@/features/auth/useAuth'
import { Card, CardContent } from '@/components/ui/Card'

export default function ProfilePage() {
  const { user } = useAuth()
  const isClient = user?.role === 'client'
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await usersApi.getProfile()
        setProfile(data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile')
        console.error('Error fetching profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    // Profile updated - auth context will refresh on next request
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {isClient ? <LandingHeader /> : <DashboardHeader title="Profile" />}
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {isClient ? <LandingHeader /> : <DashboardHeader title="Profile" />}
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-500/20 border-red-500">
            <CardContent className="p-6">
              <p className="text-white">{error || 'Profile not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {isClient ? <LandingHeader /> : <DashboardHeader title="My Profile" subtitle="Manage your personal information" />}
      <div className={`container mx-auto px-4 py-8 ${isClient ? 'pt-24' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <ProfileForm profile={profile} onUpdate={handleProfileUpdate} />
          <EmailChangeForm currentEmail={profile.email} onEmailChange={handleProfileUpdate} />
          <PasswordChangeForm />
        </motion.div>
      </div>
    </div>
  )
}

