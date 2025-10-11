// API Types
export interface User {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'DRIVER' | 'ADMIN'
  createdAt: string
  updatedAt: string
  region?: string
  avatar?: string
}

export interface Car {
  id: string
  brand: string
  model: string
  year: number
  color: string
  type: string
  seats: number
  pricePerDay: number
  location: string
  images: string[]
  description: string
  features: string[]
  driverId: string
  rating?: number
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  transmission: string
  fuelType: string
}

export interface Hotel {
  id: string
  name: string
  location: string
  address: string
  description: string
  images: string[]
  rating: number
  pricePerNight: number
  amenities: string[]
  roomTypes: RoomType[]
  createdAt: string
  updatedAt: string
}

export interface RoomType {
  id: string
  name: string
  description: string
  price?: number
  capacity: number
  amenities: string[]
  images: string[]
  pricePerNight: number
  hotelId: string
}

export interface Monument {
  id: string
  name: string
  description: string
  location: string
  historicalPeriod?: string
  architecturalStyle?: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface CarBooking {
  id: string
  carId: string
  userId: string
  startDate: string
  endDate: string
  totalAmount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  car?: Car
  user?: User
}

export interface HotelBooking {
  id: string
  hotelId: string
  userId: string
  roomTypeId: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  hotel?: Hotel
  roomType?: RoomType
  user?: User
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
}

export interface HotelSearchParams {
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

export interface MonumentSearchParams {
  query?: string
  location?: string
  historicalPeriod?: string
  architecturalStyle?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: 'CLIENT' | 'DRIVER' | 'ADMIN'
  region?: string
}

export interface CreateCarBookingData {
  carId: string
  startDate: string
  endDate: string
  pickupTime: string
  dropoffTime: string
  extras: {
    gps: boolean
    insurance: boolean
    childSeat: boolean
  }
}

export interface CreateHotelBookingData {
  hotelId: string
  roomTypeId: string
  checkInDate: string
  checkOutDate: string
  guests: number
  rooms: number
}

// Additional utility types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchFilters {
  query?: string
  location?: string
  dateRange?: {
    startDate: string
    endDate: string
  }
  priceRange?: {
    min: number
    max: number
  }
  amenities?: string[]
  type?: string
}

export interface FormError {
  field: string
  message: string
}

export interface ValidationErrors {
  [key: string]: string
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseComponentProps {
  label?: string
  placeholder?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

// Route types
export interface RouteConfig {
  path: string
  component: React.ComponentType
  roles?: string[]
  requiresAuth?: boolean
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
  }
  fonts: {
    sans: string
    serif: string
    mono: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
}

// Payment types
export interface Payment {
  id: string
  bookingId: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  method: 'stripe' | 'paypal' | 'bank_transfer'
  transactionId?: string
  refundAmount?: number
  bookingType?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentData {
  bookingId: string
  amount: number
  currency: string
  method: 'stripe' | 'paypal' | 'bank_transfer'
  returnUrl?: string
}

// Dispute types
export interface Dispute {
  id: string
  bookingId: string
  userId: string
  driverId?: string
  type: 'payment' | 'service' | 'damage' | 'cancellation'
  status: 'open' | 'investigating' | 'resolved' | 'closed' | 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'
  description: string
  evidence?: string[]
  resolution?: string
  reason?: string
  bookingType?: string
  createdAt: string
  updatedAt: string
}

// Weather types
export interface CurrentWeather {
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  visibility: number
  windSpeed: number
  windDirection: number
  description: string
  timestamp: string
}

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
  forecast: Array<{
    date: string
    temperature: {
      min: number
      max: number
    }
    description: string
    precipitation: number
  }>
}