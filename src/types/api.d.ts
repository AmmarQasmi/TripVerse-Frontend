// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'DRIVER' | 'ADMIN'
  createdAt: string
  updatedAt: string
  phone?: string
  avatar?: string
  isVerified?: boolean
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  driverLicense?: string
  carDocuments?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: 'CLIENT' | 'DRIVER'
  phone?: string
}

// Hotel types
export interface Hotel {
  id: string
  name: string
  description: string
  location: string
  address: string
  rating?: number
  pricePerNight?: number
  images?: string[]
  amenities?: string[]
  roomTypes?: RoomType[]
  createdAt: string
  updatedAt: string
}

export interface RoomType {
  id: string
  hotelId: string
  name: string
  description: string
  capacity: number
  pricePerNight: number
  amenities: string[]
  images?: string[]
  availability?: RoomAvailability[]
}

export interface RoomAvailability {
  id: string
  roomTypeId: string
  date: string
  availableRooms: number
  totalRooms: number
}

export interface HotelSearchParams {
  query?: string
  location?: string
  checkIn?: string
  checkOut?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  amenities?: string[]
}

// Car types
export interface Car {
  id: string
  brand: string
  model: string
  year: number
  color: string
  type: string
  seats: number
  transmission: 'MANUAL' | 'AUTOMATIC'
  fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
  pricePerDay: number
  location: string
  rating?: number
  images?: string[]
  features?: string[]
  driverId: string
  driver?: User
  availability?: CarAvailability[]
  createdAt: string
  updatedAt: string
}

export interface CarAvailability {
  id: string
  carId: string
  date: string
  isAvailable: boolean
}

export interface CarSearchParams {
  query?: string
  location?: string
  startDate?: string
  endDate?: string
  type?: string
  seats?: number
  minPrice?: number
  maxPrice?: number
  transmission?: string
  fuelType?: string
}

// Booking types
export interface HotelBooking {
  id: string
  userId: string
  hotelId: string
  roomTypeId: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED'
  paymentId?: string
  user?: User
  hotel?: Hotel
  roomType?: RoomType
  payment?: Payment
  createdAt: string
  updatedAt: string
}

export interface CarBooking {
  id: string
  userId: string
  carId: string
  startDate: string
  endDate: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED'
  paymentId?: string
  user?: User
  car?: Car
  payment?: Payment
  createdAt: string
  updatedAt: string
}

export interface CreateHotelBookingData {
  hotelId: string
  roomTypeId: string
  checkInDate: string
  checkOutDate: string
  guests: number
}

export interface CreateCarBookingData {
  carId: string
  startDate: string
  endDate: string
}

// Payment types
export interface Payment {
  id: string
  bookingId: string
  bookingType: 'HOTEL' | 'CAR'
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  method: string
  transactionId?: string
  stripePaymentIntentId?: string
  refundAmount?: number
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentData {
  bookingId: string
  bookingType: 'HOTEL' | 'CAR'
  amount: number
  currency: string
  method: string
}

// Monument types
export interface Monument {
  id: string
  name: string
  description: string
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  historicalPeriod?: string
  architecturalStyle?: string
  images?: string[]
  recognitionData?: {
    confidence: number
    algorithm: string
    processedAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface MonumentSearchParams {
  query?: string
  location?: string
  historicalPeriod?: string
  architecturalStyle?: string
}

// Weather types
export interface WeatherForecast {
  location: {
    name: string
    country: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  current: CurrentWeather
  forecast: WeatherDay[]
}

export interface CurrentWeather {
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  visibility: number
  windSpeed: number
  windDirection: number
  description: string
  icon: string
  timestamp: string
}

export interface WeatherDay {
  date: string
  temperature: {
    min: number
    max: number
  }
  description: string
  icon: string
  precipitation: number
  humidity: number
  windSpeed: number
}

// Dispute types
export interface Dispute {
  id: string
  bookingId: string
  bookingType: 'HOTEL' | 'CAR'
  userId: string
  driverId?: string
  reason: string
  description: string
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'
  resolution?: string
  adminId?: string
  createdAt: string
  updatedAt: string
}
