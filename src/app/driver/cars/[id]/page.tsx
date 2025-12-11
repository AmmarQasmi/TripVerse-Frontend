'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { ImageGallery } from '@/components/hotels/ImageGallery'
import { ImageUploader } from '@/components/hotels/ImageUploader'
import { useAuth } from '@/features/auth/useAuth'
import { carsApi } from '@/lib/api/cars.api'
import { CarListingForm } from '@/components/driver/CarListingForm'

interface CarDetails {
  id: string
  driver: {
    id: string
    name: string
    city: string
    isVerified: boolean
  }
  car: {
    make: string
    model: string
    year: number
    seats: number
    transmission: string
    fuel_type: string
    color?: string
    license_plate?: string
  }
  pricing: {
    base_price_per_day: number
    distance_rate_per_km: number
  }
  images: string[]
  is_active?: boolean
  is_listed?: boolean
  createdAt: string
}

export default function ManageCarPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const carId = params.id as string

  const [car, setCar] = useState<CarDetails | null>(null)
  const [carImages, setCarImages] = useState<Array<{ id: number; url: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<string | number | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [bookingStats, setBookingStats] = useState({
    total_bookings: 0,
    active_bookings: 0,
    total_earnings: 0,
  })

  useEffect(() => {
    if (carId) {
      fetchCarData()
    }
  }, [carId])

  const fetchCarData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [carData, optimizedImages, driverCarsResponse] = await Promise.all([
        carsApi.getById(carId),
        carsApi.getOptimizedCarImages(carId).catch(() => []),
        carsApi.getDriverCars().catch(() => null),
      ])

      setCar(carData as CarDetails)

      // Fix: Use optimized images if available, otherwise use carData.images
      // Deduplicate by URL to prevent showing same image twice
      const imageMap = new Map<string, { id: number; url: string }>()
      
      if (optimizedImages.length > 0) {
        // Use optimized images with their IDs
        optimizedImages.forEach((img, index) => {
          if (!imageMap.has(img.original)) {
            imageMap.set(img.original, {
              id: img.id || index,
              url: img.original,
            })
          }
        })
      } else if (carData.images && carData.images.length > 0) {
        // Fallback to regular images, deduplicate
        carData.images.forEach((url, index) => {
          if (!imageMap.has(url)) {
            imageMap.set(url, {
              id: index,
              url,
            })
          }
        })
      }
      
      setCarImages(Array.from(imageMap.values()))

      // Get booking stats from driver cars list
      if (driverCarsResponse) {
        const driverCar = driverCarsResponse.data.find(c => c.id === carId)
        if (driverCar) {
          setBookingStats(driverCar.booking_stats)
          setCar(prev => prev ? {
            ...prev,
            is_active: driverCar.is_active,
            is_listed: (driverCar as any).is_listed,
          } : null)
        }
      }
    } catch (err: any) {
      console.error('Error fetching car:', err)
      setError(err.response?.data?.message || 'Failed to load car details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: number | string) => {
    if (!car) return

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }

    setDeletingImageId(imageId)
    setError(null)

    try {
      await carsApi.deleteCarImage(carId, String(imageId))
      setSuccess('Image deleted successfully')
      await fetchCarData()
    } catch (err: any) {
      console.error('Error deleting image:', err)
      setError(err.response?.data?.message || 'Failed to delete image')
    } finally {
      setDeletingImageId(null)
    }
  }

  const handleUploadImages = async () => {
    if (!car || newImages.length === 0) return

    setIsUploadingImages(true)
    setError(null)
    setSuccess(null)

    try {
      await carsApi.uploadCarImages(carId, newImages)
      setSuccess(`${newImages.length} image(s) uploaded successfully`)
      setNewImages([])
      await fetchCarData()
    } catch (err: any) {
      console.error('Error uploading images:', err)
      setError(err.response?.data?.message || 'Failed to upload images')
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleSaveCarChanges = async (formData: any) => {
    if (!car) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await carsApi.update(carId, {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        seats: formData.seats,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        base_price_per_day: formData.base_price_per_day,
        distance_rate_per_km: formData.distance_rate_per_km,
        license_plate: formData.license_plate,
      })
      setSuccess('Car details updated successfully')
      setIsEditing(false)
      await fetchCarData()
    } catch (err: any) {
      console.error('Error updating car:', err)
      setError(err.response?.data?.message || 'Failed to update car')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="Manage Car"
          subtitle="Loading car details..."
          backUrl="/driver/cars"
          backLabel="Back to Cars"
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-gray-900 text-xl">Loading car details...</div>
        </div>
      </div>
    )
  }

  if (error && !car) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="Manage Car"
          subtitle="Error loading car"
          backUrl="/driver/cars"
          backLabel="Back to Cars"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-gray-900">{error}</p>
              <Button onClick={() => router.push('/driver/cars')} variant="outline" className="mt-4">
                Back to Cars
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!car) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title={`${car.car.make} ${car.car.model}`}
        subtitle="Manage your car listing"
        backUrl="/driver/cars"
        backLabel="Back to Cars"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Error/Success Messages */}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{bookingStats.total_bookings}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{bookingStats.active_bookings}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-3xl font-bold text-gray-900">
                      PKR {bookingStats.total_earnings.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-bold text-gray-900">
                      {car.is_active ? '✅ Active' : '⏸️ Inactive'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {car.is_listed ? '📋 Listed' : '🔒 Unlisted'}
                    </p>
                  </div>
                  <div className="text-4xl">🚗</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Car Information */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">Car Information</CardTitle>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <CarListingForm
                  car={{
                    make: car.car.make,
                    model: car.car.model,
                    year: car.car.year,
                    color: car.car.color,
                    seats: car.car.seats,
                    transmission: car.car.transmission,
                    fuel_type: car.car.fuel_type,
                    base_price_per_day: car.pricing.base_price_per_day,
                    distance_rate_per_km: car.pricing.distance_rate_per_km,
                    license_plate: car.car.license_plate,
                  }}
                  onSubmit={handleSaveCarChanges}
                  isLoading={isSaving}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Make & Model</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {car.car.make} {car.car.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="text-xl font-semibold text-gray-900">{car.car.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="text-xl font-semibold text-gray-900">{car.car.color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seats</p>
                    <p className="text-xl font-semibold text-gray-900">{car.car.seats}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="text-xl font-semibold text-gray-900 capitalize">{car.car.transmission}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuel Type</p>
                    <p className="text-xl font-semibold text-gray-900 capitalize">{car.car.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="text-xl font-semibold text-gray-900">{car.car.license_plate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Base Price per Day</p>
                    <p className="text-xl font-semibold text-gray-900">
                      PKR {car.pricing.base_price_per_day.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distance Rate per KM</p>
                    <p className="text-xl font-semibold text-gray-900">
                      PKR {car.pricing.distance_rate_per_km.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Car Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {carImages.length > 0 && (
                <ImageGallery
                  images={carImages}
                  onDelete={handleDeleteImage}
                  isDeleting={deletingImageId !== null}
                />
              )}

              <div>
                <ImageUploader
                  onImagesSelected={setNewImages}
                  maxImages={10}
                  existingImages={carImages.map(img => img.url)}
                />
                {newImages.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleUploadImages}
                      disabled={isUploadingImages}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUploadingImages ? 'Uploading...' : `Upload ${newImages.length} Image(s)`}
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

