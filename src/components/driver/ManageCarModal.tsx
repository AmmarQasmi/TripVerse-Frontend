'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageGallery } from '@/components/hotels/ImageGallery'
import { ImageUploader } from '@/components/hotels/ImageUploader'
import { carsApi } from '@/lib/api/cars.api'
import { CarListingForm } from '@/components/driver/CarListingForm'

interface CarDetails {
  id: string
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
    base_fare?: number
    per_km_rate?: number
    per_minute_rate?: number
    minimum_fare?: number
  }
  availability?: {
    available_for_rental?: boolean
    available_for_ride_hailing?: boolean
  }
  images: string[]
  is_active?: boolean
  is_listed?: boolean
}

interface BookingStats {
  total_bookings: number
  active_bookings: number
  total_earnings: number
}

interface ManageCarModalProps {
  carId: string
  onClose: () => void
  onUpdated?: () => void
}

export function ManageCarModal({ carId, onClose, onUpdated }: ManageCarModalProps) {
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
  const [togglingListing, setTogglingListing] = useState(false)
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total_bookings: 0,
    active_bookings: 0,
    total_earnings: 0,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

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

      const nextCar: CarDetails = {
        ...(carData as any),
      }

      if (driverCarsResponse) {
        const driverCar = driverCarsResponse.data.find((c) => c.id === carId)
        if (driverCar) {
          setBookingStats(driverCar.booking_stats)
          nextCar.is_active = driverCar.is_active
          nextCar.is_listed = driverCar.is_listed
          nextCar.availability = {
            available_for_rental: driverCar.availability?.available_for_rental ?? true,
            available_for_ride_hailing: driverCar.availability?.available_for_ride_hailing ?? false,
          }
          nextCar.pricing = {
            ...nextCar.pricing,
            base_fare: driverCar.pricing?.base_fare,
            per_km_rate: driverCar.pricing?.per_km_rate,
            per_minute_rate: driverCar.pricing?.per_minute_rate,
            minimum_fare: driverCar.pricing?.minimum_fare,
          }
        }
      }

      setCar(nextCar)

      const imageMap = new Map<string, { id: number; url: string }>()
      if (optimizedImages.length > 0) {
        optimizedImages.forEach((img: any, index: number) => {
          if (!imageMap.has(img.original)) {
            imageMap.set(img.original, { id: img.id || index, url: img.original })
          }
        })
      } else if ((carData as any).images?.length > 0) {
        ;(carData as any).images.forEach((url: string, index: number) => {
          if (!imageMap.has(url)) {
            imageMap.set(url, { id: index, url })
          }
        })
      }
      setCarImages(Array.from(imageMap.values()))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load car details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleListing = async () => {
    if (!car) return
    try {
      setTogglingListing(true)
      const newListed = !car.is_listed
      await carsApi.updateCarAvailability(carId, { is_listed: newListed })
      setCar((prev) => (prev ? { ...prev, is_listed: newListed } : null))
      onUpdated?.()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing status')
    } finally {
      setTogglingListing(false)
    }
  }

  const handleDeleteImage = async (imageId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    setDeletingImageId(imageId)
    setError(null)
    setSuccess(null)

    try {
      await carsApi.deleteCarImage(carId, String(imageId))
      setSuccess('Image deleted successfully')
      await fetchCarData()
      onUpdated?.()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete image')
    } finally {
      setDeletingImageId(null)
    }
  }

  const handleUploadImages = async () => {
    if (newImages.length === 0) return

    setIsUploadingImages(true)
    setError(null)
    setSuccess(null)

    try {
      await carsApi.uploadCarImages(carId, newImages)
      setSuccess(`${newImages.length} image(s) uploaded successfully`)
      setNewImages([])
      await fetchCarData()
      onUpdated?.()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images')
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleSaveCarChanges = async (formData: any) => {
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

      await carsApi.updateRideHailingSettings(carId, {
        base_fare: formData.base_fare,
        per_km_rate: formData.per_km_rate,
        per_minute_rate: formData.per_minute_rate,
        minimum_fare: formData.minimum_fare,
        available_for_rental: formData.available_for_rental,
        available_for_ride_hailing: formData.available_for_ride_hailing,
      })

      setSuccess('Car details updated successfully')
      setIsEditing(false)
      await fetchCarData()
      onUpdated?.()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update car')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isLoading ? 'Loading...' : `${car?.car.make || ''} ${car?.car.model || ''}`.trim() || 'Manage Car'}
            </h2>
            <p className="text-sm text-gray-500">Edit car details, pricing, availability and images</p>
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

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">Loading car details...</div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">{success}</div>
              )}

              {car && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold">{bookingStats.total_bookings}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Active Bookings</p>
                      <p className="text-2xl font-bold">{bookingStats.active_bookings}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold">PKR {bookingStats.total_earnings.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Listing</p>
                      <Button
                        onClick={handleToggleListing}
                        disabled={togglingListing}
                        className={`mt-2 w-full ${car.is_listed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                      >
                        {togglingListing ? '...' : car.is_listed ? 'Unlist' : 'List'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {car && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Car Information</CardTitle>
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
                          available_for_rental: car.availability?.available_for_rental ?? true,
                          available_for_ride_hailing: car.availability?.available_for_ride_hailing ?? false,
                          base_fare: car.pricing.base_fare,
                          per_km_rate: car.pricing.per_km_rate,
                          per_minute_rate: car.pricing.per_minute_rate,
                          minimum_fare: car.pricing.minimum_fare,
                        }}
                        onSubmit={handleSaveCarChanges}
                        isLoading={isSaving}
                        onCancel={() => setIsEditing(false)}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><span className="font-medium text-gray-600">Make & Model:</span> {car.car.make} {car.car.model}</p>
                        <p><span className="font-medium text-gray-600">Year:</span> {car.car.year}</p>
                        <p><span className="font-medium text-gray-600">Color:</span> {car.car.color || 'N/A'}</p>
                        <p><span className="font-medium text-gray-600">Seats:</span> {car.car.seats}</p>
                        <p><span className="font-medium text-gray-600">Transmission:</span> {car.car.transmission}</p>
                        <p><span className="font-medium text-gray-600">Fuel Type:</span> {car.car.fuel_type}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
                      existingImages={carImages.map((img) => img.url)}
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
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
