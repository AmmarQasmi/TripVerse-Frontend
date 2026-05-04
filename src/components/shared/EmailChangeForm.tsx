'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { usersApi, UserProfile } from '@/lib/api/users.api'

interface EmailChangeFormProps {
  currentEmail: string
  onEmailChange: (updatedProfile: UserProfile) => void
}

export function EmailChangeForm({ currentEmail, onEmailChange }: EmailChangeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    new_email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    setIsLoading(true)

    try {
      const response = await usersApi.changeEmail({
        new_email: formData.new_email,
        password: formData.password,
      })
      onEmailChange(response.user)
      setIsOpen(false)
      setFormData({
        new_email: '',
        password: '',
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change email')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Card className="card-accent-line premium-card">
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">Current email: <strong className="text-gray-900">{currentEmail}</strong></p>
          <Button onClick={() => setIsOpen(true)} className="card-button-primary">
            Change Email
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-accent-line premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Change Email</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Email"
            type="email"
            value={formData.new_email}
            onChange={(e) => setFormData({ ...formData, new_email: e.target.value })}
            required
            disabled={isLoading}
          />

          <Input
            label="Current Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
            placeholder="Enter your current password to confirm"
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Email'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

