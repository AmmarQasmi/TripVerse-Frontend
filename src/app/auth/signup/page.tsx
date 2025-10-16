'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authApi, cityApi } from '@/lib/api/auth.api'
import { City, RegisterData } from '@/types'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // Default to client
    city_id: '',
  })
  const [cities, setCities] = useState<City[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  // Fetch cities and regions on component mount
  useEffect(() => {
    fetchCities()
    fetchRegions()
  }, [])

  // Filter cities when region changes
  useEffect(() => {
    if (selectedRegion) {
      setFilteredCities(cities.filter(city => city.region === selectedRegion))
    } else {
      setFilteredCities(cities)
    }
  }, [selectedRegion, cities])

  const fetchCities = async () => {
    try {
      const data = await cityApi.getCities()
      setCities(data)
      setFilteredCities(data)
    } catch (error) {
      console.error('Failed to fetch cities:', error)
    }
  }

  const fetchRegions = async () => {
    try {
      const data = await cityApi.getRegions()
      setRegions(data)
    } catch (error) {
      console.error('Failed to fetch regions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      setIsLoading(false)
      return
    }

    if (!formData.city_id) {
      setErrors({ city_id: 'Please select a city' })
      setIsLoading(false)
      return
    }

    try {
      // Prepare signup data
      const signupData: RegisterData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'client' | 'driver',
        city_id: parseInt(formData.city_id),
      }

      // Call API - cookie is automatically set by backend
      const response = await authApi.signup(signupData)

      // Redirect based on role from response
      if (response.user.role === 'driver') {
        router.push('/driver/dashboard')
      } else if (response.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/client/dashboard')
      }
    } catch (error: any) {
      console.error('Signup failed:', error)
      // Extract error message from axios error
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed. Please try again.'
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transform: 'scale(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 opacity-85 z-0"></div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-3xl">
        <div className="bg-white rounded-3xl shadow-2xl p-10 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-2">
                TripVerse
              </h1>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-800">
              Create Your Account
            </h2>
            <p className="text-gray-600 mt-1">Join us and start exploring the world</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                error={errors.full_name}
                className="bg-white"
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                error={errors.email}
                className="bg-white"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'client')}
                  className={`p-5 border-2 rounded-xl transition-all bg-white ${
                    formData.role === 'client'
                      ? 'border-cyan-900 bg-cyan-50 shadow-md'
                      : 'border-gray-300 hover:border-cyan-600 hover:shadow'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 mb-2 text-cyan-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold text-base text-gray-900">Traveler</span>
                    <span className="text-xs text-gray-600 mt-1">Book hotels & cars</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'driver')}
                  className={`p-5 border-2 rounded-xl transition-all bg-white ${
                    formData.role === 'driver'
                      ? 'border-cyan-900 bg-cyan-50 shadow-md'
                      : 'border-gray-300 hover:border-cyan-600 hover:shadow'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 mb-2 text-cyan-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="font-semibold text-base text-gray-900">Driver</span>
                    <span className="text-xs text-gray-600 mt-1">Provide car services</span>
                  </div>
                </button>
              </div>
              {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Region and City Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Region Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value)
                    setFormData(prev => ({ ...prev, city_id: '' })) // Reset city when region changes
                  }}
                  className="w-full h-11 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-900 focus:border-transparent transition-colors"
                >
                  <option value="" className="text-gray-500">All Regions</option>
                  {regions.map((region) => (
                    <option key={region} value={region} className="text-gray-900">
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city_id}
                  onChange={(e) => handleInputChange('city_id', e.target.value)}
                  required
                  className="w-full h-11 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-900 focus:border-transparent transition-colors"
                >
                  <option value="" className="text-gray-500">Select your city</option>
                  {filteredCities.map((city) => (
                    <option key={city.id} value={city.id} className="text-gray-900">
                      {city.name} {selectedRegion ? '' : `(${city.region})`}
                    </option>
                  ))}
                </select>
                {errors.city_id && <p className="mt-2 text-sm text-red-600">{errors.city_id}</p>}
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  error={errors.password}
                  className="bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  error={errors.confirmPassword}
                  className="bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-1 text-cyan-900 border-gray-300 rounded focus:ring-cyan-900 focus:ring-2"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                I agree to TripVerse's{' '}
                <Link href="/terms" className="text-cyan-900 font-medium hover:text-teal-900 transition-colors underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-cyan-900 font-medium hover:text-teal-900 transition-colors underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 hover:from-blue-900 hover:via-cyan-950 hover:to-teal-950 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-700">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-cyan-900 font-semibold hover:text-teal-900 transition-colors underline"
              >
                Login here
              </Link>
            </p>
          </div>

          {/* Social Signup - Optional (not implemented in backend yet) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                disabled
                className="flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 rounded-xl opacity-50 cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-3 text-sm font-semibold text-gray-700">Google</span>
              </button>
              <button 
                type="button"
                disabled
                className="flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 rounded-xl opacity-50 cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-3 text-sm font-semibold text-gray-700">Facebook</span>
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">Social login coming soon</p>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute -left-10 -top-10 w-32 h-32 opacity-20">
          <svg viewBox="0 0 200 200" className="text-blue-800">
            <path fill="currentColor" d="M39.5,-65.5C54.5,-58.1,72.3,-53.5,81.2,-42.8C90.1,-32.1,90.1,-15.4,87.5,-0.3C84.9,14.8,79.7,28.3,70.8,38.9C61.9,49.5,49.3,57.2,36.2,63.4C23.1,69.6,9.5,74.3,-4.7,73.9C-18.9,73.5,-33.4,68,-45.8,59.5C-58.2,51,-68.5,39.5,-74.9,26.1C-81.3,12.7,-83.8,-2.6,-79.8,-15.3C-75.8,-28,-65.3,-38.1,-53.3,-47.1C-41.3,-56.1,-27.8,-64,-14.5,-68.5C-1.2,-73,11.9,-74.1,24.5,-72.9C37.1,-71.7,49.2,-68.2,39.5,-65.5Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>
    </div>
  )
}
