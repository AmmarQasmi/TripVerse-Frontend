'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
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
    imageFiles?: File[]
  }) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

export interface RoomTypeFormRef {
  tryGetData: () => {
    name: string
    description?: string
    max_occupancy: number
    base_price: number
    total_rooms: number
    amenities?: string[]
    images?: string[]
    imageFiles?: File[]
  } | null
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

export const RoomTypeForm = forwardRef<RoomTypeFormRef, RoomTypeFormProps>(
  function RoomTypeForm({ initialData, onSubmit, onCancel, isLoading = false, submitLabel }, ref) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    max_occupancy: initialData?.max_occupancy || 2,
    base_price: initialData?.base_price || 0,
    total_rooms: initialData?.total_rooms || 1,
    amenities: initialData?.amenities || [] as string[],
    images: initialData?.images || [] as string[],
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(initialData?.images || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setImagePreviewUrls(initialData.images || [])
      setImageFiles([])
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!validate()) return

    await onSubmit({
      name: formData.name,
      description: formData.description || undefined,
      max_occupancy: formData.max_occupancy,
      base_price: formData.base_price,
      total_rooms: formData.total_rooms,
      amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
      imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
    })
    
    // Reset form after successful submission if no initialData (for new room types)
    if (!initialData) {
      setFormData({
        name: '',
        description: '',
        max_occupancy: 2,
        base_price: 0,
        total_rooms: 1,
        amenities: [],
        images: [],
      })
      setImageFiles([])
      setImagePreviewUrls([])
      setErrors({})
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const maxImages = 8
    const remaining = maxImages - imagePreviewUrls.length
    const toAdd = files.slice(0, remaining)
    setImageFiles(prev => [...prev, ...toAdd])
    const newPreviews = toAdd.map(f => URL.createObjectURL(f))
    setImagePreviewUrls(prev => [...prev, ...newPreviews])
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImagePreview = (index: number) => {
    const existingCount = formData.images.length
    if (index < existingCount) {
      // Remove existing URL
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    } else {
      // Remove newly added file
      const fileIndex = index - existingCount
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex))
    }
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  useImperativeHandle(ref, () => ({
    tryGetData: () => {
      if (!validate()) return null
      return {
        name: formData.name,
        description: formData.description || undefined,
        max_occupancy: formData.max_occupancy,
        base_price: formData.base_price,
        total_rooms: formData.total_rooms,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
      }
    },
  }))

  return (
    <div className="space-y-6" onSubmit={handleSubmit}>
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

      {/* Room Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Room Images ({imagePreviewUrls.length} / 8)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={imagePreviewUrls.length >= 8}
          >
            Add Images
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {imagePreviewUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={url}
                  alt={`Room image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImagePreview(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">Click to add room images</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button 
          type="button" 
          disabled={isLoading}
          onClick={() => handleSubmit()}
        >
          {isLoading ? 'Saving...' : submitLabel ?? (initialData?.id ? 'Update Room Type' : 'Add Room Type')}
        </Button>
      </div>
    </div>
  )
  }
)

