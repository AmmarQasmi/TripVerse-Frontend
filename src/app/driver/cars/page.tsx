'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useDriverCars } from '@/features/drivers/useDriverCars'

export default function DriverCarsPage() {
  const [isAddingCar, setIsAddingCar] = useState(false)
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    type: '',
    seats: 4,
    transmission: 'AUTOMATIC' as 'MANUAL' | 'AUTOMATIC',
    fuelType: 'GASOLINE' as 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID',
    pricePerDay: 0,
    location: '',
    features: [] as string[],
  })

  const { data: cars, isLoading, createCar, updateCar, deleteCar } = useDriverCars()

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCar(newCar)
      setNewCar({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        type: '',
        seats: 4,
        transmission: 'AUTOMATIC',
        fuelType: 'GASOLINE',
        pricePerDay: 0,
        location: '',
        features: [],
      })
      setIsAddingCar(false)
    } catch (error) {
      console.error('Failed to add car:', error)
    }
  }

  const handleDeleteCar = async (carId: string) => {
    if (confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(carId)
      } catch (error) {
        console.error('Failed to delete car:', error)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Your Cars
            </h1>
            <p className="text-lg text-gray-600">
              Add, edit, and manage your car listings for rental.
            </p>
          </div>
          <Button onClick={() => setIsAddingCar(true)}>
            Add New Car
          </Button>
        </div>
      </div>

      {/* Add Car Modal */}
      {isAddingCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Add New Car</CardTitle>
                <Button variant="ghost" onClick={() => setIsAddingCar(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCar} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Brand"
                    value={newCar.brand}
                    onChange={(e) => setNewCar(prev => ({ ...prev, brand: e.target.value }))}
                    required
                  />
                  <Input
                    label="Model"
                    value={newCar.model}
                    onChange={(e) => setNewCar(prev => ({ ...prev, model: e.target.value }))}
                    required
                  />
                  <Input
                    label="Year"
                    type="number"
                    value={newCar.year}
                    onChange={(e) => setNewCar(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    required
                  />
                  <Input
                    label="Color"
                    value={newCar.color}
                    onChange={(e) => setNewCar(prev => ({ ...prev, color: e.target.value }))}
                    required
                  />
                  <Input
                    label="Type"
                    value={newCar.type}
                    onChange={(e) => setNewCar(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="e.g., Sedan, SUV, Hatchback"
                    required
                  />
                  <Input
                    label="Seats"
                    type="number"
                    min="1"
                    value={newCar.seats}
                    onChange={(e) => setNewCar(prev => ({ ...prev, seats: parseInt(e.target.value) }))}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission
                    </label>
                    <select
                      value={newCar.transmission}
                      onChange={(e) => setNewCar(prev => ({ ...prev, transmission: e.target.value as any }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AUTOMATIC">Automatic</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={newCar.fuelType}
                      onChange={(e) => setNewCar(prev => ({ ...prev, fuelType: e.target.value as any }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GASOLINE">Gasoline</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ELECTRIC">Electric</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                  <Input
                    label="Price Per Day ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCar.pricePerDay}
                    onChange={(e) => setNewCar(prev => ({ ...prev, pricePerDay: parseFloat(e.target.value) }))}
                    required
                  />
                  <Input
                    label="Location"
                    value={newCar.location}
                    onChange={(e) => setNewCar(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                    required
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Add Car
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddingCar(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cars List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))
        ) : cars && cars.length > 0 ? (
          cars.map((car) => (
            <Card key={car.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200">
                {car.images?.[0] ? (
                  <img
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  {car.brand} {car.model} ({car.year})
                </h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>{car.type} • {car.seats} seats • {car.transmission}</p>
                  <p>{car.color} • {car.fuelType}</p>
                  <p className="font-medium">${car.pricePerDay}/day</p>
                  <p>📍 {car.location}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteCar(car.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              🚗 No cars added yet
            </div>
            <p className="text-gray-400 mb-6">
              Start earning by adding your first car to the platform.
            </p>
            <Button onClick={() => setIsAddingCar(true)}>
              Add Your First Car
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
