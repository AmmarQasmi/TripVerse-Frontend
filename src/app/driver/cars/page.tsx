'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { carsApi } from '@/lib/api/cars.api'
import { DoughnutChart } from '@/components/client/DoughnutChart'
import { CarListingForm } from '@/components/driver/CarListingForm'
import { DriverModeToggle } from '@/components/driver/DriverModeToggle'
import { ManageCarModal } from '@/components/driver/ManageCarModal'

interface DriverCar {
  id: string
  brand: string
  model: string
  year: number
  color: string
  type: string
  pricePerDay: number
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL'
  isListed: boolean
  totalBookings: number
  totalEarnings: number
  image?: string
  // Dual-mode availability
  availableForRental: boolean
  availableForRideHailing: boolean
  // Ride-hailing pricing
  baseFare?: number
  perKmRate?: number
  perMinuteRate?: number
}

export default function DriverCarsPage() {
  const { user } = useAuth()
  const [cars, setCars] = useState<DriverCar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [managingCarId, setManagingCarId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [driverMode, setDriverMode] = useState<'OFFLINE' | 'RIDE_HAILING' | 'RENTAL'>('OFFLINE')

  const loadCars = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }
      setError(null)
      const response = await carsApi.getDriverCars()

      const transformedCars: DriverCar[] = response.data.map((car) => ({
        id: car.id,
        brand: car.car.make,
        model: car.car.model,
        year: car.car.year,
        color: car.car.color,
        type: car.car.transmission === 'automatic' ? 'AUTOMATIC' : 'MANUAL',
        pricePerDay: car.pricing.base_price_per_day,
        status: car.is_active ? 'ACTIVE' : 'INACTIVE',
        isListed: car.is_listed ?? car.is_active,
        totalBookings: car.booking_stats.total_bookings,
        totalEarnings: car.booking_stats.total_earnings,
        image: car.images && car.images.length > 0 ? car.images[0] : undefined,
        availableForRental: car.availability?.available_for_rental ?? true,
        availableForRideHailing: car.availability?.available_for_ride_hailing ?? false,
        baseFare: car.pricing?.base_fare,
        perKmRate: car.pricing?.per_km_rate,
        perMinuteRate: car.pricing?.per_minute_rate,
      }))

      setCars(transformedCars)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cars')
      console.error('Error fetching driver cars:', err)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  // Filter cars based on current driver mode
  const filteredCars = cars.filter(car => {
    if (driverMode === 'OFFLINE') return true // Show all cars when offline
    if (driverMode === 'RENTAL') return car.availableForRental
    if (driverMode === 'RIDE_HAILING') return car.availableForRideHailing
    return true
  })

  useEffect(() => {
    if (user?.role === 'driver') {
      loadCars(true)
    }
  }, [user])

  const handleAddCar = async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await carsApi.create({
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
        // Dual-mode availability
        available_for_rental: formData.available_for_rental,
        available_for_ride_hailing: formData.available_for_ride_hailing,
        // Ride-hailing pricing
        base_fare: formData.base_fare,
        per_km_rate: formData.per_km_rate,
        per_minute_rate: formData.per_minute_rate,
        minimum_fare: formData.minimum_fare,
      })

      // Upload images if provided
      if (formData.images && formData.images.length > 0) {
        await carsApi.uploadCarImages(response.id, formData.images)
      }

      setShowAddModal(false)
      await loadCars(false)
    } catch (err: any) {
      console.error('Error adding car:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleListing = async (carId: string, currentlyListed: boolean) => {
    try {
      setTogglingId(carId)
      const newListed = !currentlyListed
      await carsApi.updateCarAvailability(carId, { is_listed: newListed })
      setCars(prev => prev.map(car =>
        car.id === carId ? { ...car, isListed: newListed } : car
      ))
    } catch (err: any) {
      console.error('Error toggling listing:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const getStatusColor = (status: string, isListed: boolean) => {
    if (!isListed) return 'bg-orange-100 text-orange-800'
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string, isListed: boolean) => {
    if (!isListed) return 'Unlisted'
    switch (status) {
      case 'ACTIVE':
        return 'Active'
      case 'INACTIVE':
        return 'Inactive'
      case 'PENDING_APPROVAL':
        return 'Pending Approval'
      default:
        return status
    }
  }

  const totalCars = cars.length
  const activeCars = cars.filter(car => car.status === 'ACTIVE' && car.isListed).length
  const totalBookings = cars.reduce((sum, car) => sum + car.totalBookings, 0)
  const totalEarnings = cars.reduce((sum, car) => sum + car.totalEarnings, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Car Management"
          subtitle="Manage your car listings"
          backUrl="/driver/dashboard"
          backLabel="Back to Dashboard"
          centered
        />
        <PageLoader variant="skeleton" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Car Management"
          subtitle="Manage your car listings"
          backUrl="/driver/dashboard"
          backLabel="Back to Dashboard"
          centered
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {managingCarId && (
        <ManageCarModal
          carId={managingCarId}
          onClose={() => setManagingCarId(null)}
          onUpdated={() => loadCars(false)}
        />
      )}
      <PageHeader 
        title="Car Management"
        subtitle="Manage your fleet and track performance"
        backUrl="/driver/dashboard"
        backLabel="Back to Dashboard"
        centered
        action={
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90 font-semibold px-6 py-3 rounded-xl"
          >
            <span className="mr-2">➕</span>
            Add New Car
          </Button>
        }
      />
      <div className="container mx-auto px-4 py-8">
        {/* Driver Mode Toggle */}
        <div className="mb-8">
          <DriverModeToggle onModeChange={setDriverMode} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <DoughnutChart
            label="Total Cars"
            value={totalCars}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            delay={0.1}
            maxValue={Math.max(totalCars, 10)}
          />
          <DoughnutChart
            label="Active Cars"
            value={activeCars}
            gradient="bg-gradient-to-br from-green-500 to-emerald-500"
            delay={0.2}
            maxValue={Math.max(totalCars, 1)}
          />
          <DoughnutChart
            label="Total Bookings"
            value={totalBookings}
            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            delay={0.3}
            maxValue={Math.max(totalBookings, 10)}
          />
          <DoughnutChart
            label="Total Earnings"
            value={`PKR ${totalEarnings.toLocaleString()}`}
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
            delay={0.4}
            maxValue={Math.max(totalEarnings, 100000)}
          />
        </div>

        {/* Cars List */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-75 overflow-hidden">
                  {/* Car Image */}
                  <div className="relative h-48 bg-gray-200">
                    {car.image && (
                      <img
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status, car.isListed)}`}>
                      {getStatusText(car.status, car.isListed)}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      {car.brand} {car.model}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{car.year} • {car.color} • {car.type}</p>
                    {/* Mode Availability Badges */}
                    <div className="flex gap-2 mt-2">
                      {car.availableForRental && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Rentals
                        </span>
                      )}
                      {car.availableForRideHailing && (
                        <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
                          Rides
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Pricing Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <p className="text-lg font-bold text-blue-700">
                          PKR {car.pricePerDay.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">Per Day</p>
                      </div>
                      {car.availableForRideHailing && car.perKmRate ? (
                        <div className="bg-teal-50 p-2 rounded-lg border border-teal-200">
                          <p className="text-lg font-bold text-teal-700">
                            PKR {car.perKmRate}
                          </p>
                          <p className="text-xs text-teal-600">Per KM</p>
                        </div>
                      ) : (
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                          <p className="text-lg font-bold text-blue-700">{car.totalBookings}</p>
                          <p className="text-xs text-blue-600">Bookings</p>
                        </div>
                      )}
                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <p className="text-lg font-bold text-emerald-700">
                          {car.totalEarnings > 0 ? `${(car.totalEarnings / 1000).toFixed(0)}k` : '0'}
                        </p>
                        <p className="text-xs text-emerald-600">Earned</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="w-full flex-1 border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500"
                        onClick={() => setManagingCarId(car.id)}
                      >
                        ✏️ Manage
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleToggleListing(car.id, car.isListed)}
                        disabled={togglingId === car.id}
                        className={`px-3 ${car.isListed ? 'border-teal-400 text-teal-600 hover:bg-teal-50 hover:border-teal-500' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600'}`}
                      >
                        {togglingId === car.id ? '...' : car.isListed ? '🔒 Unlist' : '📋 List'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            {cars.length > 0 ? (
              // Cars exist but none match the current mode filter
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold mb-2">
                  No cars for this mode
                </h3>
                <p className="text-gray-500 mb-8">
                  {driverMode === 'RENTAL' 
                    ? 'None of your cars are enabled for rentals. Enable rental mode in car settings.'
                    : driverMode === 'RIDE_HAILING'
                    ? 'None of your cars are enabled for ride-hailing. Enable ride-hailing mode in car settings.'
                    : 'No cars match the current filter.'}
                </p>
              </>
            ) : (
              // No cars at all
              <>
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-semibold mb-2">
                  No cars listed yet
                </h3>
                <p className="text-gray-500 mb-8">
                  Start earning by listing your first car
                </p>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  <span className="mr-2">➕</span>
                  Add Your First Car
                </Button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Car Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !isSubmitting && setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">List a New Car</h2>
                    <p className="text-gray-600 text-sm mt-1">Fill in the details to add your car</p>
                  </div>
                  <button
                    onClick={() => !isSubmitting && setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <CarListingForm
                  onSubmit={handleAddCar}
                  isLoading={isSubmitting}
                  onCancel={() => setShowAddModal(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}