'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
      <div className="premium-gradient-bg">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-white mx-auto"></div>
            <div className="text-white text-lg font-medium">Loading profile...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="premium-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <Card 
            className="bg-red-50 border-red-200 backdrop-blur-md"
            style={{
              borderTop: '3px solid',
              borderImage: 'linear-gradient(to right, #dc2626, #991b1b) 1 0 0 0',
              backgroundColor: 'rgba(254, 242, 242, 0.9)'
            }}
          >
            <CardContent className="p-6">
              <p className="text-red-600 font-medium">{error || 'Profile not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <ProfileForm profile={profile} onUpdate={handleProfileUpdate} />
          <EmailChangeForm currentEmail={profile.email} onEmailChange={handleProfileUpdate} />
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  )
}

