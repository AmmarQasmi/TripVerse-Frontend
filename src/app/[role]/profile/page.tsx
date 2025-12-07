'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ProfileForm } from '@/components/shared/ProfileForm'
import { PasswordChangeForm } from '@/components/shared/PasswordChangeForm'
import { EmailChangeForm } from '@/components/shared/EmailChangeForm'
import { usersApi, UserProfile } from '@/lib/api/users.api'
import { useAuth } from '@/features/auth/useAuth'
import { Card, CardContent } from '@/components/ui/Card'

export default function ProfilePage() {
  const { user } = useAuth()
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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-gray-900 text-xl">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600">{error || 'Profile not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
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

