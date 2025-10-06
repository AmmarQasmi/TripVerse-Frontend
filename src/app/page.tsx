import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to TripVerse
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your ultimate travel companion. Discover amazing hotels, rent cars, 
            explore monuments, and get weather forecasts for your perfect trip.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/(client)/hotels">
              <Button size="lg" className="mr-4">
                Explore Hotels
              </Button>
            </Link>
            <Link href="/(client)/cars">
              <Button size="lg" variant="outline">
                Rent Cars
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">🏨 Hotels</h3>
              <p className="text-gray-600">
                Find and book the perfect hotel for your stay with real-time availability.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">🚗 Car Rental</h3>
              <p className="text-gray-600">
                Rent cars from verified drivers and explore your destination at your own pace.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">🏛️ Monument Recognition</h3>
              <p className="text-gray-600">
                Upload photos to identify historical monuments and learn about their history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
