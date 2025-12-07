'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-gray-900 text-xl">Loading settings...</div>
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
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                <p className="text-sm text-gray-600">
                  To change your email or password, please visit your{' '}
                  <Link href={`/${role}/profile`} className="text-cyan-600 hover:text-cyan-700 underline">
                    profile page
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Data Privacy</h4>
                <p className="text-sm text-gray-600">
                  Your data is encrypted and stored securely. We never share your personal information with third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {error && (
            <Card className="bg-red-500/20 border-red-500">
              <CardContent className="p-4">
                <p className="text-sm text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="bg-green-500/20 border-green-500">
              <CardContent className="p-4">
                <p className="text-sm text-green-600">Settings saved successfully!</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

