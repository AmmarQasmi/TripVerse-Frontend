'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { UserProfile } from '@/lib/api/users.api'
import { httpClient } from '@/lib/api/http'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface City {
  id: number
  name: string
  region: string
}

interface ProfileFormProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    city_id: profile.city_id,
  })

  const loadCities = async () => {
    try {
      const data = await httpClient.get<City[]>(API_ENDPOINTS.CITIES.BASE)
      setCities(data)
    } catch (err) {
      console.error('Failed to load cities:', err)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (cities.length === 0) {
      loadCities()
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      full_name: profile.full_name,
      city_id: profile.city_id,
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await httpClient.put<{ message: string; user: UserProfile }>(
        API_ENDPOINTS.USERS.BASE + '/profile',
        formData
      )
      onUpdate(response.user)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="card-accent-line premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          {!isEditing && (
            <Button onClick={handleEdit} className="card-button-primary" size="sm">
              Edit Profile
            </Button>
          )}
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
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            disabled={!isEditing}
            required
          />

          <Input
            label="Email"
            type="email"
            value={profile.email}
            disabled
            className="bg-gray-50"
          />

          <Select
            label="City"
            value={formData.city_id}
            onChange={(e) => setFormData({ ...formData, city_id: Number(e.target.value) })}
            disabled={!isEditing}
            options={cities.map(city => ({
              value: city.id,
              label: `${city.name}, ${city.region}`,
            }))}
            required
          />

          <div className="text-sm space-y-2 pt-4 border-t border-gray-100">
            <p className="text-gray-700"><strong className="text-gray-900">Role:</strong> <span className="text-teal-600">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span></p>
            <div className="flex items-center gap-2">
              <span className="text-gray-700"><strong className="text-gray-900">Status:</strong></span>
              <span className="status-badge">
                {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600"><strong className="text-gray-900">Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>

          {isEditing && (
            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

