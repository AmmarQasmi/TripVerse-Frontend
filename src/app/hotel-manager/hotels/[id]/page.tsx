'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { PageHeader } from '@/components/shared/PageHeader'
import { ImageUploader } from '@/components/hotels/ImageUploader'
import { ImageGallery } from '@/components/hotels/ImageGallery'
import { RoomTypeForm } from '@/components/hotels/RoomTypeForm'
import { RoomTypeCard } from '@/components/hotels/RoomTypeCard'
import { useAuth } from '@/features/auth/useAuth'
import { hotelsApi } from '@/lib/api/hotels.api'
import { Hotel, RoomType } from '@/types'

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

interface HotelDetails extends Hotel {
  is_listed?: boolean
  is_active?: boolean
  total_bookings?: number
  total_earnings?: number
}

interface RoomAvailability {
  room_type_id: number
  room_type_name: string
  total_rooms: number
  booked_rooms: number
  available_rooms: number
}

export default function ManageHotelPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const hotelId = params.id as string

  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [hotelImages, setHotelImages] = useState<Array<{ id: number; url: string }>>([])
  const [availability, setAvailability] = useState<RoomAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
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

  const fetchHotelData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [hotelData, availabilityData, optimizedImages] = await Promise.all([
        hotelsApi.getById(hotelId),
        hotelsApi.getHotelAvailability(hotelId).catch(() => null),
        hotelsApi.getOptimizedImages(hotelId).catch(() => []),
      ])

      setHotel(hotelData as HotelDetails)
      setFormData({
        name: hotelData.name,
        description: hotelData.description || '',
        address: hotelData.address || '',
        star_rating: hotelData.rating || 4,
        amenities: hotelData.amenities || [],
      })

      // Map optimized images to include IDs
      if (optimizedImages.length > 0) {
        setHotelImages(optimizedImages.map(img => ({
          id: img.id,
          url: img.original,
        })))
      } else if (hotelData.images && hotelData.images.length > 0) {
        // Fallback to URLs if optimized images not available
        setHotelImages(hotelData.images.map((url, index) => ({
          id: index,
          url,
        })))
      } else {
        setHotelImages([])
      }

      if (availabilityData) {
        setAvailability(availabilityData.room_availability)
      }

      // Also try to get manager hotel stats
      try {
        const managerHotels = await hotelsApi.getManagerHotels()
        const managerHotel = managerHotels.find(h => String(h.id) === hotelId)
        if (managerHotel) {
          setHotel(prev => prev ? {
            ...prev,
            is_listed: managerHotel.is_listed,
            is_active: managerHotel.is_active,
            total_bookings: managerHotel.total_bookings,
            total_earnings: managerHotel.total_earnings,
          } : null)
        }
      } catch (err) {
        // Ignore - stats are optional
      }
    } catch (err: any) {
      console.error('Error fetching hotel:', err)
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
      console.error('Error updating hotel:', err)
      setError(err.response?.data?.message || 'Failed to update hotel')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleAvailability = async () => {
    if (!hotel) return

    const newStatus = !hotel.is_listed
    const confirmMessage = newStatus
      ? 'Are you sure you want to list this hotel? It will be visible to customers.'
      : 'Are you sure you want to unlist this hotel? It will no longer be visible to customers.'

    if (!window.confirm(confirmMessage)) {
      return
    }

    setIsToggling(true)
    setError(null)
    setSuccess(null)

    try {
      await hotelsApi.updateHotelAvailability(hotelId, { is_listed: newStatus })
      setSuccess(`Hotel ${newStatus ? 'listed' : 'unlisted'} successfully`)
      await fetchHotelData()
    } catch (err: any) {
      console.error('Error toggling availability:', err)
      setError(err.response?.data?.message || 'Failed to update availability')
    } finally {
      setIsToggling(false)
    }
  }

  const handleAddRoomType = async (roomTypeData: any) => {
    setError(null)
    setSuccess(null)

    try {
      await hotelsApi.addRoomType(hotelId, roomTypeData)
      setSuccess('Room type added successfully')
      setShowRoomTypeForm(false)
      await fetchHotelData()
    } catch (err: any) {
      console.error('Error adding room type:', err)
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
      console.error('Error updating room type:', err)
      setError(err.response?.data?.message || 'Failed to update room type')
    }
  }

  const handleDeleteRoomType = async (roomTypeId: string) => {
    if (!window.confirm('Are you sure you want to delete this room type? This action cannot be undone.')) {
      return
    }

    setDeletingRoomTypeId(roomTypeId)
    setError(null)
    setSuccess(null)

    try {
      await hotelsApi.deleteRoomType(hotelId, roomTypeId)
      setSuccess('Room type deleted successfully')
      await fetchHotelData()
    } catch (err: any) {
      console.error('Error deleting room type:', err)
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
      console.error('Error uploading images:', err)
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
      console.error('Error deleting image:', err)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PageHeader
          title="Loading..."
          subtitle="Fetching hotel details"
          backUrl="/hotel-manager/hotels"
          backLabel="Back to Hotels"
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-white text-xl">Loading hotel details...</div>
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PageHeader
          title="Hotel Not Found"
          subtitle="The hotel you're looking for doesn't exist"
          backUrl="/hotel-manager/hotels"
          backLabel="Back to Hotels"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-white">Hotel not found or you don't have permission to access it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const roomTypesWithAvailability = hotel.roomTypes?.map(roomType => {
    const avail = availability.find(a => String(a.room_type_id) === roomType.id)
    return {
      ...roomType,
      total_rooms: avail?.total_rooms,
      booked_rooms: avail?.booked_rooms,
      available_rooms: avail?.available_rooms,
    }
  }) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader
        title={hotel.name}
        subtitle="Manage your hotel listing"
        backUrl="/hotel-manager/hotels"
        backLabel="Back to Hotels"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {error && (
            <Card className="bg-red-500/20 border-red-500">
              <CardContent className="p-4">
                <p className="text-red-200">{error}</p>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="bg-green-500/20 border-green-500">
              <CardContent className="p-4">
                <p className="text-green-200">{success}</p>
              </CardContent>
            </Card>
          )}

          {/* Hotel Overview & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hotel.is_listed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hotel.is_listed ? 'Listed' : 'Unlisted'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Active</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hotel.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hotel.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white mb-1">
                  {hotel.total_bookings || 0}
                </div>
                <div className="text-gray-300 text-sm">Total Bookings</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  PKR {(hotel.total_earnings || 0).toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm">Total Earnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Availability Toggle */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Listing Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {hotel.is_listed ? 'Hotel is listed and visible to customers' : 'Hotel is unlisted and hidden from customers'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Toggle this to show or hide your hotel in search results
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleAvailability}
                    disabled={isToggling}
                    className={hotel.is_listed ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {isToggling ? 'Updating...' : hotel.is_listed ? 'Unlist Hotel' : 'List Hotel'}
                  </Button>
                </div>
                
                {!hotel.is_active && (
                  <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      <strong>Status: Inactive</strong> - Your hotel is listed but not active. 
                      It will only be visible to customers after an admin activates it. 
                      Please wait for admin approval or contact support if you believe this is an error.
                    </p>
                  </div>
                )}
                
                {hotel.is_active && !hotel.is_listed && (
                  <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      <strong>Status: Active but Unlisted</strong> - Your hotel is active but currently unlisted. 
                      Click "List Hotel" above to make it visible to customers.
                    </p>
                  </div>
                )}
                
                {hotel.is_active && hotel.is_listed && (
                  <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <p className="text-green-200 text-sm">
                      <strong>Status: Active and Listed</strong> - Your hotel is active and listed. 
                      It is currently visible to customers and accepting bookings.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Hotel Info */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Hotel Information</CardTitle>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
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
                    rows={4}
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
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
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
                          <span className="text-sm text-gray-300 capitalize">
                            {amenity.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        // Reset form data
                        setFormData({
                          name: hotel.name,
                          description: hotel.description || '',
                          address: hotel.address || '',
                          star_rating: hotel.rating || 4,
                          amenities: hotel.amenities || [],
                        })
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
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Name:</span>
                    <p className="text-white">{hotel.name}</p>
                  </div>
                  {hotel.description && (
                    <div>
                      <span className="text-gray-400 text-sm">Description:</span>
                      <p className="text-white">{hotel.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-sm">Address:</span>
                    <p className="text-white">{hotel.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Location:</span>
                    <p className="text-white">{hotel.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Star Rating:</span>
                    <p className="text-white">{hotel.rating} ⭐</p>
                  </div>
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">Amenities:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {hotel.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full capitalize"
                          >
                            {amenity.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Types Management */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Room Types</CardTitle>
                {!showRoomTypeForm && !editingRoomType && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRoomTypeForm(true)}
                  >
                    + Add Room Type
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showRoomTypeForm && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <RoomTypeForm
                    onSubmit={handleAddRoomType}
                    onCancel={() => setShowRoomTypeForm(false)}
                  />
                </div>
              )}

              {editingRoomType && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <RoomTypeForm
                    initialData={{
                      id: editingRoomType.id,
                      name: editingRoomType.name,
                      description: editingRoomType.description,
                      max_occupancy: editingRoomType.capacity,
                      base_price: editingRoomType.pricePerNight,
                      total_rooms: 1, // This might need to come from availability
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
                <p className="text-gray-400 text-sm">
                  No room types added yet. Add your first room type to start accepting bookings.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Images Management */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hotelImages.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-3">Current Images</h3>
                  <ImageGallery
                    images={hotelImages}
                    onDelete={(id) => handleDeleteImage(String(id))}
                    isDeleting={deletingImageId !== null}
                  />
                </div>
              )}

              <div>
                <h3 className="text-white font-medium mb-3">Upload New Images</h3>
                <ImageUploader
                  onImagesSelected={(files) => setNewImages(files)}
                  maxImages={10}
                  existingImages={hotelImages.map(img => img.url)}
                />
                {newImages.length > 0 && (
                  <div className="mt-4">
                    <Button
                      onClick={handleUploadImages}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      Upload {newImages.length} Image{newImages.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

