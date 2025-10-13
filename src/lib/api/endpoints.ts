export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REGISTER: '/auth/signup', // Alias
    ME: '/auth/me', // Get current user
    PROFILE: '/auth/me', // Alias for compatibility
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // City endpoints
  CITIES: {
    BASE: '/cities',
    REGIONS: '/cities/regions',
    BY_ID: (id: number) => `/cities/${id}`,
  },

  // Driver endpoints
  DRIVERS: {
    PROFILE: '/drivers/profile',
  },

  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Hotel endpoints
  HOTELS: {
    BASE: '/hotels',
    SEARCH: '/hotels/search',
    BY_ID: (id: string) => `/hotels/${id}`,
    CREATE: '/hotels',
    UPDATE: (id: string) => `/hotels/${id}`,
    DELETE: (id: string) => `/hotels/${id}`,
    ROOM_TYPES: (id: string) => `/hotels/${id}/room-types`,
  },

  // Car endpoints
  CARS: {
    BASE: '/cars',
    SEARCH: '/cars/search',
    BY_ID: (id: string) => `/cars/${id}`,
    CREATE: '/cars',
    UPDATE: (id: string) => `/cars/${id}`,
    DELETE: (id: string) => `/cars/${id}`,
    AVAILABLE: '/cars/available',
  },

  // Hotel booking endpoints
  HOTEL_BOOKINGS: {
    BASE: '/hotel-bookings',
    BY_ID: (id: string) => `/hotel-bookings/${id}`,
    CREATE: '/hotel-bookings',
    UPDATE: (id: string) => `/hotel-bookings/${id}`,
    CANCEL: (id: string) => `/hotel-bookings/${id}/cancel`,
    USER: '/hotel-bookings/user',
    DRIVER: '/hotel-bookings/driver',
  },

  // Car booking endpoints
  CAR_BOOKINGS: {
    BASE: '/car-bookings',
    BY_ID: (id: string) => `/car-bookings/${id}`,
    CREATE: '/car-bookings',
    UPDATE: (id: string) => `/car-bookings/${id}`,
    CANCEL: (id: string) => `/car-bookings/${id}/cancel`,
    USER: '/car-bookings/user',
    DRIVER: '/car-bookings/driver',
  },

  // Payment endpoints
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    CREATE: '/payments',
    STRIPE_CHECKOUT: '/payments/stripe/checkout',
    STRIPE_WEBHOOK: '/payments/stripe/webhook',
  },

  // Monument endpoints
  MONUMENTS: {
    BASE: '/monuments',
    SEARCH: '/monuments/search',
    BY_ID: (id: string) => `/monuments/${id}`,
    CREATE: '/monuments',
    UPDATE: (id: string) => `/monuments/${id}`,
    DELETE: (id: string) => `/monuments/${id}`,
    RECOGNIZE: '/monuments/recognize',
    EXPORT: (id: string) => `/monuments/${id}/export`,
    CACHE: '/monuments/cache',
  },

  // Weather endpoints
  WEATHER: {
    FORECAST: '/weather/forecast',
    CURRENT: '/weather/current',
    LOCATION: (lat: number, lon: number) => `/weather/location/${lat}/${lon}`,
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    DRIVERS: '/admin/drivers',
    VERIFY_DRIVER: (id: string) => `/admin/drivers/${id}/verify`,
    PAYMENTS: '/admin/payments',
    DISPUTES: '/admin/disputes',
    RESOLVE_DISPUTE: (id: string) => `/admin/disputes/${id}/resolve`,
  },
} as const
