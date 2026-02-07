'use client'

interface HotelAmenitiesProps {
  amenities: string[]
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
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Amenities</h3>
        <p className="text-gray-400 text-sm">No amenities listed</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Amenities</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {amenities.map((amenity, index) => (
          <div
            key={index}
            className="flex items-center space-x-2.5 px-3 py-2.5 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-gray-300 text-sm font-medium">
              {amenityLabels[amenity.toLowerCase()] || amenity}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
