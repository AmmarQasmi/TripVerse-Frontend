import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
  permissionDenied: boolean
  permissionGranted: boolean
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  autoRequest?: boolean
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    autoRequest = false,
  } = options

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionDenied: false,
    permissionGranted: false,
  })

  // Check permission status
  const checkPermission = async () => {
    if (!navigator.permissions || !navigator.geolocation) {
      return 'unsupported'
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return result.state // 'granted', 'denied', or 'prompt'
    } catch {
      return 'unsupported'
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionDenied: false,
          permissionGranted: true,
        })
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location'
        let permissionDenied = false

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            permissionDenied = true
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
          permissionGranted: false,
        })
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  }

  useEffect(() => {
    const initGeolocation = async () => {
      if (autoRequest) {
        const permissionStatus = await checkPermission()
        
        // Only auto-request if permission is already granted
        if (permissionStatus === 'granted') {
          requestLocation()
        } else if (permissionStatus === 'denied') {
          setState(prev => ({
            ...prev,
            permissionDenied: true,
            error: 'Location permission was previously denied',
          }))
        }
        // If 'prompt', don't auto-request - let the user trigger it via UI
      }
    }

    initGeolocation()
  }, [autoRequest])

  return {
    ...state,
    requestLocation,
    checkPermission,
  }
}
