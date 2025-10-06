import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Hotel } from '@/types'

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video bg-gray-200 relative">
        {hotel.images?.[0] && (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{hotel.name}</CardTitle>
        <p className="text-sm text-gray-600">{hotel.location}</p>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-700 line-clamp-2">
          {hotel.description}
        </p>
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
          <span>⭐ {hotel.rating || 'N/A'}</span>
          <span>🏨 {hotel.roomTypes?.length || 0} room types</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          ${hotel.pricePerNight || 'N/A'}/night
        </div>
        <Button size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
