'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RoomType } from '@/types'

interface RoomTypeCardProps {
  roomType: RoomType & {
    total_rooms?: number
    booked_rooms?: number
    available_rooms?: number
  }
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export function RoomTypeCard({ roomType, onEdit, onDelete, isDeleting = false }: RoomTypeCardProps) {
  const availability = roomType.available_rooms !== undefined
    ? `${roomType.available_rooms} / ${roomType.total_rooms} available`
    : null

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
            {roomType.description && (
              <p className="text-sm text-gray-600 mt-1">{roomType.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Max Occupancy:</span>
            <span className="ml-2 font-medium">{roomType.capacity}</span>
          </div>
          <div>
            <span className="text-gray-600">Price per Night:</span>
            <span className="ml-2 font-medium">PKR {roomType.pricePerNight.toLocaleString()}</span>
          </div>
          {availability && (
            <div className="col-span-2">
              <span className="text-gray-600">Availability:</span>
              <span className={`ml-2 font-medium ${
                roomType.available_rooms === 0 ? 'text-red-600' : 
                roomType.available_rooms! < roomType.total_rooms! / 2 ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {availability}
              </span>
            </div>
          )}
        </div>

        {roomType.amenities && roomType.amenities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {roomType.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize"
                >
                  {amenity.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
