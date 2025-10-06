import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Car } from '@/types'

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video bg-gray-200 relative">
        {car.images?.[0] && (
          <img
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">
          {car.brand} {car.model}
        </CardTitle>
        <p className="text-sm text-gray-600">{car.year} • {car.color}</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Type:</span> {car.type}
          </div>
          <div>
            <span className="font-medium">Seats:</span> {car.seats}
          </div>
          <div>
            <span className="font-medium">Transmission:</span> {car.transmission}
          </div>
          <div>
            <span className="font-medium">Fuel:</span> {car.fuelType}
          </div>
        </div>
        
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
          <span>⭐ {car.rating || 'N/A'}</span>
          <span>📍 {car.location}</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          ${car.pricePerDay}/day
        </div>
        <Button size="sm">
          Rent Now
        </Button>
      </CardFooter>
    </Card>
  )
}
