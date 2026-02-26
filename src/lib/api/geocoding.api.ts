/**
 * Reverse geocoding: Convert coordinates to city name
 * Using OpenStreetMap Nominatim API (free, no API key required)
 */
export const geocodingApi = {
  /**
   * Get city name from coordinates
   */
  getCityFromCoordinates: async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            'User-Agent': 'TripVerse Application', // Required by Nominatim
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch location data')
      }

      const data = await response.json()

      // Extract city name with fallbacks
      const city = 
        data.address?.city || 
        data.address?.town || 
        data.address?.village || 
        data.address?.municipality ||
        data.address?.county ||
        data.address?.state ||
        'Unknown Location'

      return city
    } catch (error) {
      console.error('Geocoding error:', error)
      throw error
    }
  },
}
