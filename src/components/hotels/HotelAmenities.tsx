'use client'

interface HotelAmenitiesProps {
  amenities: string[]
}

const amenityIcons: { [key: string]: string } = {
  'wifi': '📶',
  'pool': '🏊',
  'parking': '🅿️',
  'breakfast': '🍳',
  'gym': '💪',
  'spa': '🧘',
  'restaurant': '🍽️',
  'bar': '🍸',
  'airport-shuttle': '🚌',
  'pet-friendly': '🐕',
  'business-center': '💼',
  'room-service': '🏠',
  'kitchen': '🍳',
  'laundry': '👕',
  'concierge': '🎩',
  'valet': '🚗',
  'fitness': '💪',
  'wellness': '🧘‍♀️',
  'entertainment': '🎮',
  'kids-club': '👶'
}

const amenityLabels: { [key: string]: string } = {
  'wifi': 'Free WiFi',
  'pool': 'Swimming Pool',
  'parking': 'Free Parking',
  'breakfast': 'Free Breakfast',
  'gym': 'Fitness Center',
  'spa': 'Spa & Wellness',
  'restaurant': 'Restaurant',
  'bar': 'Bar/Lounge',
  'airport-shuttle': 'Airport Shuttle',
  'pet-friendly': 'Pet Friendly',
  'business-center': 'Business Center',
  'room-service': 'Room Service',
  'kitchen': 'Kitchen',
  'laundry': 'Laundry Service',
  'concierge': 'Concierge',
  'valet': 'Valet Parking',
  'fitness': 'Fitness Center',
  'wellness': 'Wellness Center',
  'entertainment': 'Entertainment',
  'kids-club': 'Kids Club'
}

export function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Amenities</h3>
        <p className="text-gray-400">No amenities listed</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h3 className="text-2xl font-bold text-white mb-6">Amenities</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map((amenity, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-2xl">
              {amenityIcons[amenity.toLowerCase()] || '✓'}
            </span>
            <span className="text-gray-300 font-medium">
              {amenityLabels[amenity.toLowerCase()] || amenity}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
