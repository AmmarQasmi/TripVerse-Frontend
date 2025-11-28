'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface RoomTypeFormProps {
  initialData?: {
    id?: string
    name: string
    description?: string
    max_occupancy: number
    base_price: number
    total_rooms: number
    amenities?: string[]
    images?: string[]
  }
  onSubmit: (data: {
    name: string
    description?: string
    max_occupancy: number
    base_price: number
    total_rooms: number
    amenities?: string[]
    images?: string[]
  }) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

const ROOM_TYPE_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'DOUBLE', label: 'Double' },
  { value: 'DELUXE', label: 'Deluxe' },
  { value: 'SUITE', label: 'Suite' },
]

const AMENITY_OPTIONS = [
  'wifi',
  'tv',
  'ac',
  'minibar',
  'safe',
  'balcony',
  'ocean_view',
  'city_view',
  'breakfast',
  'room_service',
]

export function RoomTypeForm({ initialData, onSubmit, onCancel, isLoading = false }: RoomTypeFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    max_occupancy: initialData?.max_occupancy || 2,
    base_price: initialData?.base_price || 0,
    total_rooms: initialData?.total_rooms || 1,
    amenities: initialData?.amenities || [] as string[],
    images: initialData?.images || [] as string[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        max_occupancy: initialData.max_occupancy || 2,
        base_price: initialData.base_price || 0,
        total_rooms: initialData.total_rooms || 1,
        amenities: initialData.amenities || [],
        images: initialData.images || [],
      })
    }
  }, [initialData])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.name = 'Room type name is required'
    }

    if (formData.max_occupancy < 1) {
      newErrors.max_occupancy = 'Max occupancy must be at least 1'
    }

    if (formData.base_price <= 0) {
      newErrors.base_price = 'Base price must be greater than 0'
    }

    if (formData.total_rooms < 1) {
      newErrors.total_rooms = 'Total rooms must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      name: formData.name,
      description: formData.description || undefined,
      max_occupancy: formData.max_occupancy,
      base_price: formData.base_price,
      total_rooms: formData.total_rooms,
      amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
    })
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Room Type Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            required
            options={[
              { value: '', label: 'Select room type' },
              ...ROOM_TYPE_OPTIONS
            ]}
          />
        </div>

        <div>
          <Input
            type="number"
            label="Max Occupancy *"
            value={formData.max_occupancy}
            onChange={(e) => setFormData(prev => ({ ...prev, max_occupancy: parseInt(e.target.value) || 0 }))}
            error={errors.max_occupancy}
            min={1}
            required
          />
        </div>
      </div>

      <div>
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder="Describe the room type..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            label="Base Price per Night (PKR) *"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
            error={errors.base_price}
            min={0}
            step="0.01"
            required
          />
        </div>

        <div>
          <Input
            type="number"
            label="Total Rooms *"
            value={formData.total_rooms}
            onChange={(e) => setFormData(prev => ({ ...prev, total_rooms: parseInt(e.target.value) || 0 }))}
            error={errors.total_rooms}
            min={1}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Amenities
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AMENITY_OPTIONS.map(amenity => (
            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {amenity.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Room Type' : 'Add Room Type'}
        </Button>
      </div>
    </form>
  )
}

