import { useQuery } from '@tanstack/react-query'
import { hotelsApi } from '@/lib/api/hotels.api'
import { Hotel } from '@/types'

interface HotelSearchParams {
  query?: string
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  rooms?: number
  minPrice?: number
  maxPrice?: number
  starRating?: number[]
  amenities?: string[]
  propertyType?: string[]
}

export function useHotelSearch(params: HotelSearchParams) {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelsApi.search(params),
    enabled: !!(params.query || params.location),
    // Add some mock data for development
    placeholderData: (previousData) => {
      if (params.location) {
        return generateMockHotels(params.location)
      }
      return previousData
    }
  })
}

export function useHotelById(id: string) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: () => hotelsApi.getById(id),
    enabled: !!id,
    // Add mock data for development
    placeholderData: () => generateMockHotel(id)
  })
}

// Mock data generators for development
function generateMockHotels(location: string): Hotel[] {
  const mockHotels: Hotel[] = [
    {
      id: '1',
      name: 'Grand Plaza Hotel',
      description: 'Luxury hotel in the heart of the city with world-class amenities and exceptional service.',
      location: location,
      address: '123 Main Street, ' + location,
      rating: 4.8,
      pricePerNight: 12500,
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
      amenities: ['wifi', 'pool', 'parking', 'breakfast', 'gym', 'spa'],
      roomTypes: [
        {
          id: '1',
          hotelId: '1',
          name: 'Deluxe King Room',
          description: 'Spacious room with king bed and city view',
          capacity: 2,
          pricePerNight: 12500,
          amenities: ['wifi', 'breakfast'],
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80']
        },
        {
          id: '2',
          hotelId: '1',
          name: 'Executive Suite',
          description: 'Luxury suite with separate living area',
          capacity: 4,
          pricePerNight: 25000,
          amenities: ['wifi', 'breakfast', 'spa'],
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Boutique Hotel Central',
      description: 'Modern boutique hotel offering personalized service and contemporary design.',
      location: location,
      address: '456 Central Avenue, ' + location,
      rating: 4.6,
      pricePerNight: 8500,
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'],
      amenities: ['wifi', 'breakfast', 'restaurant', 'bar'],
      roomTypes: [
        {
          id: '3',
          hotelId: '2',
          name: 'Standard Room',
          description: 'Comfortable room with modern amenities',
          capacity: 2,
          pricePerNight: 8500,
          amenities: ['wifi', 'breakfast'],
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80']
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Resort Paradise',
      description: 'Beachfront resort with stunning ocean views and all-inclusive amenities.',
      location: location,
      address: '789 Beach Road, ' + location,
      rating: 4.9,
      pricePerNight: 18000,
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
      amenities: ['wifi', 'pool', 'breakfast', 'restaurant', 'spa', 'gym'],
      roomTypes: [
        {
          id: '4',
          hotelId: '3',
          name: 'Ocean View Suite',
          description: 'Spacious suite with panoramic ocean views',
          capacity: 3,
          pricePerNight: 18000,
          amenities: ['wifi', 'breakfast', 'spa'],
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Business Hotel Express',
      description: 'Perfect for business travelers with conference facilities and fast internet.',
      location: location,
      address: '321 Business District, ' + location,
      rating: 4.4,
      pricePerNight: 7500,
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
      amenities: ['wifi', 'breakfast', 'gym', 'business-center'],
      roomTypes: [
        {
          id: '5',
          hotelId: '4',
          name: 'Business Room',
          description: 'Room designed for business travelers',
          capacity: 2,
          pricePerNight: 7500,
          amenities: ['wifi', 'breakfast'],
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80']
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Historic Inn',
      description: 'Charming historic hotel with traditional architecture and modern comforts.',
      location: location,
      address: '654 Heritage Lane, ' + location,
      rating: 4.7,
      pricePerNight: 11000,
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
      amenities: ['wifi', 'breakfast', 'restaurant', 'parking'],
      roomTypes: [
        {
          id: '6',
          hotelId: '5',
          name: 'Heritage Room',
          description: 'Authentic room with historic charm',
          capacity: 2,
          pricePerNight: 11000,
          amenities: ['wifi', 'breakfast'],
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80']
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Modern Apartments',
      description: 'Contemporary apartment-style accommodation with kitchen facilities.',
      location: location,
      address: '987 Modern Street, ' + location,
      rating: 4.5,
      pricePerNight: 9500,
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'],
      amenities: ['wifi', 'kitchen', 'parking', 'gym'],
      roomTypes: [
        {
          id: '7',
          hotelId: '6',
          name: 'Studio Apartment',
          description: 'Modern studio with kitchenette',
          capacity: 2,
          pricePerNight: 9500,
          amenities: ['wifi', 'kitchen'],
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  return mockHotels
}

function generateMockHotel(id: string): Hotel {
  const mockHotels = generateMockHotels('Sample City')
  return mockHotels.find(hotel => hotel.id === id) || mockHotels[0]
}
