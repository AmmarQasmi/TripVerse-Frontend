'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { usersApi, UserSettings } from '@/lib/api/users.api'
import { useAuth } from '@/features/auth/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()
  const params = useParams()
  const role = params.role as string || user?.role || 'client'
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications_enabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await usersApi.getSettings()
        setSettings(data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load settings')
        console.error('Error fetching settings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await usersApi.updateSettings(settings)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading settings..." variant="skeleton" />
  }

  return (
    <div className="premium-gradient-bg">
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences and account settings"
        backUrl={`/${role}/dashboard`}
        backLabel="Back to Dashboard"
        centered={true}
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Error Message */}
          {error && (
            <Card className="card-accent-line premium-card">
              <CardContent className="p-4 text-red-700 text-sm" style={{ position: 'relative', zIndex: 1 }}>{error}</CardContent>
            </Card>
          )}

          {/* Success Message */}
          {success && (
            <Card className="card-accent-line premium-card">
              <CardContent className="p-4 text-green-700 text-sm" style={{ position: 'relative', zIndex: 1 }}>Settings saved successfully!</CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          <Card className="card-accent-line premium-card premium-card-dark-image">
            <CardHeader style={{ position: 'relative', zIndex: 1 }}>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6" style={{ position: 'relative', zIndex: 1 }}>
              <Toggle
                checked={settings.notifications_enabled}
                onChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })}
                label="In-App Notifications"
                description="Receive notifications within the application"
              />

              <Toggle
                checked={settings.email_notifications_enabled}
                onChange={(checked) => setSettings({ ...settings, email_notifications_enabled: checked })}
                label="Email Notifications"
                description="Receive notifications via email"
              />
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="card-accent-line premium-card premium-card-dark-image">
            <CardHeader style={{ position: 'relative', zIndex: 1 }}>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" style={{ position: 'relative', zIndex: 1 }}>
              <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(to right, rgba(13,148,136,0.08), rgba(8,145,178,0.08))', border: '1px solid rgba(45,212,191,0.2)' }}>
                <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                <p className="text-sm text-gray-600">
                  To change your email or password, please visit your{' '}
                  <Link href={`/${role}/profile`} className="text-teal-600 hover:text-teal-700 underline font-medium">
                    profile page
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="card-accent-line premium-card premium-card-dark-image">
            <CardHeader style={{ position: 'relative', zIndex: 1 }}>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" style={{ position: 'relative', zIndex: 1 }}>
              <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(to right, rgba(13,148,136,0.08), rgba(8,145,178,0.08))', border: '1px solid rgba(45,212,191,0.2)' }}>
                <h4 className="font-medium text-gray-900 mb-2">Data Privacy</h4>
                <p className="text-sm text-gray-600">
                  Your data is encrypted and stored securely. We never share your personal information with third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

