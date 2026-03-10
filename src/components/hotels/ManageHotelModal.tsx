'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { ImageUploader } from '@/components/hotels/ImageUploader'
import { ImageGallery } from '@/components/hotels/ImageGallery'
import { RoomTypeForm } from '@/components/hotels/RoomTypeForm'
import { RoomTypeCard } from '@/components/hotels/RoomTypeCard'
import { hotelsApi } from '@/lib/api/hotels.api'
import { Hotel, RoomType } from '@/types'

const AMENITY_OPTIONS = [
  'wifi', 'pool', 'parking', 'breakfast', 'gym', 'spa',
  'restaurant', 'bar', 'room_service', 'concierge', 'laundry', 'business_center',
]

interface HotelDetails extends Hotel {
  is_listed?: boolean
  is_active?: boolean
}

interface RoomAvailability {
  room_type_id: number
  room_type_name: string
  total_rooms: number
  booked_rooms: number
  available_rooms: number
}

interface ManageHotelModalProps {
  hotelId: string
  onClose: () => void
}

export function ManageHotelModal({ hotelId, onClose }: ManageHotelModalProps) {
  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [hotelImages, setHotelImages] = useState<Array<{ id: number; url: string }>>([])
  const [availability, setAvailability] = useState<RoomAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    star_rating: 4,
    amenities: [] as string[],
  })

  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false)
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null)
  const [deletingRoomTypeId, setDeletingRoomTypeId] = useState<string | null>(null)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])

  useEffect(() => {
    fetchHotelData()
  }, [hotelId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const fetchHotelData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [hotelData, availabilityData, optimizedImages, managerHotels] = await Promise.all([
        hotelsApi.getById(hotelId),
        hotelsApi.getHotelAvailability(hotelId).catch(() => null),
        hotelsApi.getOptimizedImages(hotelId).catch(() => null),
        hotelsApi.getManagerHotels().catch(() => [] as any[]),
      ])

      setHotel(hotelData as HotelDetails)
      setFormData({
        name: hotelData.name,
        description: hotelData.description || '',
        address: hotelData.address || '',
        star_rating: hotelData.rating || 4,
        amenities: hotelData.amenities || [],
      })

      const optimizedArr = Array.isArray(optimizedImages) ? optimizedImages : []
      if (optimizedArr.length > 0) {
        setHotelImages(optimizedArr.map((img: any) => ({ id: img.id, url: img.original })))
      } else if (hotelData.images && hotelData.images.length > 0) {
        setHotelImages(hotelData.images.map((url: string, index: number) => ({ id: index, url })))
      } else {
        const mHotel = (managerHotels as any[]).find((h: any) => String(h.id) === hotelId)
        if (mHotel?.images?.length > 0) {
          setHotelImages(mHotel.images.map((url: string, i: number) => ({ id: i, url })))
        } else {
          setHotelImages([])
        }
      }

      if (availabilityData) {
        setAvailability(availabilityData.room_availability)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hotel details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!hotel) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await hotelsApi.update(hotelId, {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        rating: formData.star_rating,
        amenities: formData.amenities,
      })
      setSuccess('Hotel details updated successfully')
      setIsEditing(false)
      await fetchHotelData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hotel')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRoomType = async (roomTypeData: any) => {
    setError(null)
    setSuccess(null)
    try {
      const newRoomType = await hotelsApi.addRoomType(hotelId, roomTypeData)
      if (roomTypeData.imageFiles?.length > 0 && newRoomType.id) {
        await hotelsApi.uploadRoomImages(hotelId, String(newRoomType.id), roomTypeData.imageFiles).catch(() => {})
      }
      setSuccess('Room type added successfully')
      setShowRoomTypeForm(false)
      await fetchHotelData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add room type')
    }
  }

  const handleUpdateRoomType = async (roomTypeData: any) => {
    if (!editingRoomType) return
    setError(null)
    setSuccess(null)
    try {
      await hotelsApi.updateRoomType(hotelId, editingRoomType.id, roomTypeData)
      setSuccess('Room type updated successfully')
      setEditingRoomType(null)
      await fetchHotelData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update room type')
    }
  }

  const handleDeleteRoomType = async (roomTypeId: string) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return
    setDeletingRoomTypeId(roomTypeId)
    setError(null)
    setSuccess(null)
    try {
      await hotelsApi.deleteRoomType(hotelId, roomTypeId)
      setSuccess('Room type deleted successfully')
      await fetchHotelData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete room type')
    } finally {
      setDeletingRoomTypeId(null)
    }
  }

  const handleUploadImages = async () => {
    if (newImages.length === 0) return
    setError(null)
    setSuccess(null)
    try {
      await hotelsApi.uploadImages(hotelId, newImages)
      setSuccess('Images uploaded successfully')
      setNewImages([])
      await fetchHotelData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    setDeletingImageId(imageId)
    setError(null)
    setSuccess(null)
    try {
      await hotelsApi.deleteImage(hotelId, imageId)
      setSuccess('Image deleted successfully')
      await fetchHotelData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete image')
    } finally {
      setDeletingImageId(null)
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

  const roomTypesWithAvailability = hotel?.roomTypes?.map(roomType => {
    const avail = availability.find(a => String(a.room_type_id) === roomType.id)
    return {
      ...roomType,
      total_rooms: avail?.total_rooms,
      booked_rooms: avail?.booked_rooms,
      available_rooms: avail?.available_rooms,
    }
  }) || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isLoading ? 'Loading...' : hotel?.name ?? 'Manage Hotel'}
            </h2>
            <p className="text-sm text-gray-500">Edit hotel details, rooms &amp; images</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              Loading hotel details...
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              {/* Hotel Information */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Hotel Information</CardTitle>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        label="Hotel Name *"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Textarea
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                      <Input
                        label="Address *"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                      <Select
                        label="Star Rating *"
                        value={String(formData.star_rating)}
                        onChange={(e) => setFormData(prev => ({ ...prev, star_rating: parseInt(e.target.value) }))}
                        required
                        options={[
                          { value: '1', label: '1 Star' },
                          { value: '2', label: '2 Stars' },
                          { value: '3', label: '3 Stars' },
                          { value: '4', label: '4 Stars' },
                          { value: '5', label: '5 Stars' },
                        ]}
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Amenities</label>
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
                      <div className="flex justify-end space-x-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            if (hotel) {
                              setFormData({
                                name: hotel.name,
                                description: hotel.description || '',
                                address: hotel.address || '',
                                star_rating: hotel.rating || 4,
                                amenities: hotel.amenities || [],
                              })
                            }
                          }}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Name:</span> <span className="font-medium">{hotel?.name}</span></div>
                      {hotel?.description && <div><span className="text-gray-500">Description:</span> <span>{hotel.description}</span></div>}
                      <div><span className="text-gray-500">Address:</span> <span>{hotel?.address}</span></div>
                      <div><span className="text-gray-500">Location:</span> <span>{hotel?.location}</span></div>
                      <div><span className="text-gray-500">Star Rating:</span> <span>{hotel?.rating} ⭐</span></div>
                      {hotel?.amenities && hotel.amenities.length > 0 && (
                        <div>
                          <span className="text-gray-500">Amenities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hotel.amenities.map((a, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                                {a.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Room Types */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Room Types</CardTitle>
                    {!showRoomTypeForm && !editingRoomType && (
                      <Button variant="outline" size="sm" onClick={() => setShowRoomTypeForm(true)}>
                        + Add Room Type
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showRoomTypeForm && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <RoomTypeForm
                        onSubmit={handleAddRoomType}
                        onCancel={() => setShowRoomTypeForm(false)}
                      />
                    </div>
                  )}

                  {editingRoomType && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <RoomTypeForm
                        initialData={{
                          id: editingRoomType.id,
                          name: editingRoomType.name,
                          description: editingRoomType.description,
                          max_occupancy: editingRoomType.capacity,
                          base_price: editingRoomType.pricePerNight,
                          total_rooms: 1,
                          amenities: editingRoomType.amenities,
                          images: editingRoomType.images,
                        }}
                        onSubmit={handleUpdateRoomType}
                        onCancel={() => setEditingRoomType(null)}
                      />
                    </div>
                  )}

                  {roomTypesWithAvailability.length > 0 ? (
                    <div className="space-y-3">
                      {roomTypesWithAvailability.map((roomType) => (
                        <RoomTypeCard
                          key={roomType.id}
                          roomType={roomType}
                          onEdit={() => setEditingRoomType(roomType)}
                          onDelete={() => handleDeleteRoomType(roomType.id)}
                          isDeleting={deletingRoomTypeId === roomType.id}
                        />
                      ))}
                    </div>
                  ) : (
                    !showRoomTypeForm && !editingRoomType && (
                      <p className="text-gray-500 text-sm">
                        No room types added yet. Add your first room type to start accepting bookings.
                      </p>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hotelImages.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm mb-3">Current Images</h3>
                      <ImageGallery
                        images={hotelImages}
                        onDelete={(id) => handleDeleteImage(String(id))}
                        isDeleting={deletingImageId !== null}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-sm mb-3">Upload New Images</h3>
                    <ImageUploader
                      onImagesSelected={(files) => setNewImages(files)}
                      maxImages={10}
                      existingImages={hotelImages.map(img => img.url)}
                    />
                    {newImages.length > 0 && (
                      <div className="mt-3">
                        <Button onClick={handleUploadImages} className="bg-cyan-600 hover:bg-cyan-700">
                          Upload {newImages.length} Image{newImages.length > 1 ? 's' : ''}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
