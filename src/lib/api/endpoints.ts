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
    DASHBOARD: '/drivers/dashboard',
    EARNINGS: '/drivers/earnings',
    UPLOAD_DOCUMENT: '/drivers/documents/upload',
    DELETE_DOCUMENT: (id: string) => `/drivers/documents/${id}`,
    SUBMIT_VERIFICATION: '/drivers/verification/submit',
  },

  // Hotel Manager endpoints
  HOTEL_MANAGERS: {
    PROFILE: '/hotel-managers/profile',
    DASHBOARD: '/hotel-managers/dashboard',
    EARNINGS: '/hotel-managers/earnings',
    EARNINGS_BREAKDOWN: '/hotel-managers/earnings/breakdown',
    UPLOAD_DOCUMENT: '/hotel-managers/documents/upload',
    DELETE_DOCUMENT: (id: string) => `/hotel-managers/documents/${id}`,
    SUBMIT_VERIFICATION: '/hotel-managers/verification/submit',
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
    AVAILABLE_CITIES: '/hotels/available-cities',
    POPULAR_DESTINATIONS: '/hotels/popular-destinations',
    REGIONS_BY_CITY: (city: string) => `/hotels/regions/${encodeURIComponent(city)}`,
    BY_ID: (id: string) => `/hotels/${id}`,
    ROOM_AVAILABILITY: (id: string) => `/hotels/${id}/room-availability`,
    REVIEWS: (id: string) => `/hotels/${id}/reviews`,
    CAN_REVIEW: (id: string) => `/hotels/${id}/can-review`,
    CREATE: '/hotels',
    UPDATE: (id: string) => `/hotels/${id}`,
    DELETE: (id: string) => `/hotels/${id}`,
    ROOM_TYPES: (id: string) => `/hotels/${id}/room-types`,
    ROOM_TYPE: (hotelId: string, roomId: string) => `/hotels/${hotelId}/rooms/${roomId}`,
    UPLOAD_IMAGES: (id: string) => `/hotels/${id}/images/upload`,
    DELETE_IMAGE: (hotelId: string, imageId: string) => `/hotels/${hotelId}/images/${imageId}/cloudinary`,
    OPTIMIZED_IMAGES: (id: string) => `/hotels/${id}/images/optimized`,
    MANAGER_HOTELS: '/hotels/manager/hotels',
    UPDATE_AVAILABILITY: (id: string) => `/hotels/${id}/availability`,
    GET_AVAILABILITY: (id: string) => `/hotels/${id}/availability`,
    EXTERNAL_SEARCH: '/hotels/external',
    EXTERNAL_DETAILS: (placeId: string) => `/hotels/external/details/${encodeURIComponent(placeId)}`,
  },

  // Car endpoints
  CARS: {
    BASE: '/cars',
    SEARCH: '/cars/search',
    PLACES_AUTOCOMPLETE: '/cars/places/autocomplete',
    CITIES_POPULAR: '/cars/cities/popular',
    CITIES_EXPLORE: (cityName: string) => `/cars/cities/explore/${encodeURIComponent(cityName)}`,
    BY_ID: (id: string) => `/cars/${id}`,
    CREATE: '/cars/driver/cars', // Driver-specific endpoint
    UPDATE: (id: string) => `/cars/driver/cars/${id}`, // Driver-specific endpoint
    DELETE: (id: string) => `/cars/${id}`,
    AVAILABLE: '/cars/available',
    DRIVER_CARS: '/cars/driver/cars',
    CAR_MODELS: '/cars/models',
    UPLOAD_IMAGES: (id: string) => `/cars/${id}/images/upload`,
    DELETE_IMAGE: (carId: string, imageId: string) => `/cars/${carId}/images/${imageId}/cloudinary`,
    OPTIMIZED_IMAGES: (id: string) => `/cars/${id}/images/optimized`,
    UPDATE_AVAILABILITY: (id: string) => `/cars/${id}/availability`,
    BOOKINGS: {
      DRIVER_BOOKINGS: '/cars/bookings/driver-bookings',
    },
  },

  // Hotel booking endpoints
  HOTEL_BOOKINGS: {
    BASE: '/hotel-bookings',
    BY_ID: (id: string) => `/hotel-bookings/${id}`,
    CREATE: '/hotel-bookings/request',
    CREATE_WITH_PAYMENT: '/hotel-bookings/create-with-payment',
    UPDATE: (id: string) => `/hotel-bookings/${id}`,
    CANCEL: (id: string) => `/hotel-bookings/${id}/cancel`,
    CONFIRM: (id: string) => `/hotel-bookings/${id}/confirm`,
    USER: '/hotel-bookings/my-bookings',
    MANAGER_BOOKINGS: '/hotel-bookings/manager/bookings',
    MANAGER_STATS: '/hotel-bookings/manager/stats',
    ADMIN_ALL: '/hotel-bookings/admin/all',
    ROOM_UNAVAILABLE_DATES: (hotelId: string) => `/hotel-bookings/room-unavailable-dates/${hotelId}`,
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
    RECOGNIZE: '/monuments/upload',
    REVIEWS: (id: string) => `/monuments/${id}/reviews`,
    MY_RECOGNITIONS: '/monuments/my-recognitions',
    EXPORT: (id: string) => `/monuments/${id}/export`,
    CACHE: '/monuments/cache',
  },

  // Weather endpoints
  WEATHER: {
    FORECAST: '/weather/forecast',
    CURRENT: '/weather/current',
    COORDINATES_CURRENT: '/weather/coordinates/current',
    COORDINATES_FORECAST: '/weather/coordinates/forecast',
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    DRIVERS: '/admin/drivers',
    DRIVER_DETAILS: (id: string) => `/admin/drivers/${id}`,
    VERIFY_DRIVER: (id: string) => `/admin/drivers/${id}/verify`,
    SUSPEND_DRIVER: (id: string) => `/admin/drivers/${id}/suspend`,
    BAN_DRIVER: (id: string) => `/admin/drivers/${id}/ban`,
    DRIVERS_VERIFICATION: {
      PENDING: '/admin/drivers/verification/pending',
      VERIFIED: '/admin/drivers/verification/verified',
    },
    HOTELS: '/admin/hotels',
    HOTEL_DETAILS: (id: string) => `/admin/hotels/${id}`,
    UPDATE_HOTEL: (id: string) => `/admin/hotels/${id}`,
    DELETE_HOTEL: (id: string) => `/admin/hotels/${id}`,
    HOTEL_MANAGERS: '/admin/hotel-managers',
    HOTEL_MANAGER_DETAILS: (id: string) => `/admin/hotel-managers/${id}`,
    VERIFY_HOTEL_MANAGER: (id: string) => `/admin/hotel-managers/${id}/verify`,
    PENDING_HOTEL_MANAGERS: '/admin/hotel-managers/pending',
    VERIFIED_HOTEL_MANAGERS: '/admin/hotel-managers/verified',
    PAYMENTS: '/admin/payments',
    PAYMENT_DETAILS: (id: string) => `/admin/payments/${id}`,
    DISPUTES: '/admin/disputes',
    CREATE_DISPUTE: '/admin/disputes',
    DISPUTE_DETAILS: (id: string) => `/admin/disputes/${id}`,
    RESOLVE_DISPUTE: (id: string) => `/admin/disputes/${id}/resolve`,
    REPORTS: {
      BOOKINGS: '/admin/reports/bookings',
      REVENUE: '/admin/reports/revenue',
      DRIVERS: '/admin/reports/drivers',
    },
    USERS: '/admin/users',
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // Flight endpoints
  FLIGHTS: {
    SEARCH: '/flights/search',
    CREATE_BOOKING_LINK: '/flights/create-booking-link',
  },

  // AI Chat endpoints
  CHAT: {
    SESSIONS: '/chat/sessions',
    MESSAGE: '/chat/message',
    SESSION_BY_ID: (id: number) => `/chat/sessions/${id}`,
    DELETE_SESSION: (id: number) => `/chat/sessions/${id}`,
  },

  // Itinerary endpoints
  ITINERARIES: {
    BASE: '/itineraries',
    BY_ID: (id: number) => `/itineraries/${id}`,
    ENRICH: (id: number) => `/itineraries/${id}/enrich`,
    DELETE: (id: number) => `/itineraries/${id}`,
  },
} as const
