'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/shared/PageHeader'
import { ImageUploader } from '@/components/hotels/ImageUploader'
import { RoomTypeForm } from '@/components/hotels/RoomTypeForm'
import { useAuth } from '@/features/auth/useAuth'
import { hotelsApi } from '@/lib/api/hotels.api'
import { cityApi } from '@/lib/api/auth.api'
import { City } from '@/types'

const AMENITY_OPTIONS = [
  'wifi',
  'pool',
  'parking',
  'breakfast',
  'gym',
  'spa',
  'restaurant',
  'bar',
  'room_service',
  'concierge',
  'laundry',
  'business_center',
]

interface RoomTypeData {
  name: string
  description?: string
  max_occupancy: number
  base_price: number
  total_rooms: number
  amenities?: string[]
  images?: string[]
}

export default function CreateHotelPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [cities, setCities] = useState<City[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city_id: '',
    star_rating: 4,
    amenities: [] as string[],
    images: [] as File[],
    roomTypes: [] as RoomTypeData[],
  })

  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true)
        const citiesData = await cityApi.getCities()
        setCities(citiesData)
      } catch (err: any) {
        console.error('Error fetching cities:', err)
        setError('Failed to load cities')
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.city_id) {
      newErrors.city_id = 'City is required'
    }

    if (formData.star_rating < 1 || formData.star_rating > 5) {
      newErrors.star_rating = 'Star rating must be between 1 and 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      // First upload images if any
      let imageUrls: string[] = []
      if (formData.images.length > 0) {
        // For now, we'll create the hotel first, then upload images
        // The backend accepts image URLs in the create request
        // In a real implementation, you might want to upload to a temporary storage first
        // For now, we'll create without images and let the manager add them later
      }

      // Prepare hotel data
      const hotelData: any = {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address,
        city_id: parseInt(formData.city_id),
        star_rating: formData.star_rating,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
        images: imageUrls,
        roomTypes: formData.roomTypes.length > 0 ? formData.roomTypes : undefined,
      }

      const response = await hotelsApi.create(hotelData)

      // If images were selected, upload them after hotel creation
      if (formData.images.length > 0) {
        try {
          await hotelsApi.uploadImages(String(response.id), formData.images)
        } catch (imgErr) {
          console.error('Error uploading images:', imgErr)
          // Continue anyway - hotel is created, images can be added later
        }
      }

      // Redirect to hotel management page
      router.push(`/hotel-manager/hotels/${response.id}`)
    } catch (err: any) {
      console.error('Error creating hotel:', err)
      setError(err.response?.data?.message || err.message || 'Failed to create hotel')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const addRoomType = (roomType: RoomTypeData) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, roomType],
    }))
    setShowRoomTypeForm(false)
  }

  const removeRoomType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Create New Hotel"
        subtitle="Add a new hotel to your listings"
        backUrl="/hotel-manager/hotels"
        backLabel="Back to Hotels"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error && (
            <Card className="bg-red-50 border-red-200 mb-6">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Hotel Name *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  error={errors.name}
                  required
                  placeholder="Enter hotel name"
                />

                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your hotel..."
                />

                <Input
                  label="Address *"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  error={errors.address}
                  required
                  placeholder="Enter full address"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="City *"
                    value={formData.city_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, city_id: e.target.value }))}
                    error={errors.city_id}
                    required
                    disabled={isLoadingCities}
                    options={
                      isLoadingCities
                        ? [{ value: '', label: 'Loading cities...' }]
                        : [
                            { value: '', label: 'Select a city' },
                            ...cities.map(city => ({
                              value: String(city.id),
                              label: `${city.name}, ${city.region}`,
                            })),
                          ]
                    }
                  />

                  <Select
                    label="Star Rating *"
                    value={String(formData.star_rating)}
                    onChange={(e) => setFormData(prev => ({ ...prev, star_rating: parseInt(e.target.value) }))}
                    error={errors.star_rating}
                    required
                    options={[
                      { value: '1', label: '1 Star' },
                      { value: '2', label: '2 Stars' },
                      { value: '3', label: '3 Stars' },
                      { value: '4', label: '4 Stars' },
                      { value: '5', label: '5 Stars' },
                    ]}
                  />
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
                        <span className="text-sm text-gray-600 capitalize">
                          {amenity.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onImagesSelected={(files) => setFormData(prev => ({ ...prev, images: files }))}
                  maxImages={10}
                />
                <p className="text-sm text-gray-600 mt-2">
                  You can upload images now or add them later after creating the hotel.
                </p>
              </CardContent>
            </Card>

            {/* Room Types */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Room Types</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRoomTypeForm(!showRoomTypeForm)}
                  >
                    {showRoomTypeForm ? 'Cancel' : '+ Add Room Type'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showRoomTypeForm && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <RoomTypeForm
                      onSubmit={addRoomType}
                      onCancel={() => setShowRoomTypeForm(false)}
                    />
                  </div>
                )}

                {formData.roomTypes.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 font-medium">
                      Added Room Types ({formData.roomTypes.length})
                    </p>
                    {formData.roomTypes.map((roomType, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200"
                      >
                        <div>
                          <p className="font-medium">{roomType.name}</p>
                          <p className="text-gray-600 text-sm">
                            PKR {roomType.base_price.toLocaleString()} per night • {roomType.total_rooms} rooms
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRoomType(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.roomTypes.length === 0 && !showRoomTypeForm && (
                  <p className="text-gray-600 text-sm">
                    Room types are optional. You can add them now or after creating the hotel.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingCities}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isSubmitting ? 'Creating Hotel...' : 'Create Hotel'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

