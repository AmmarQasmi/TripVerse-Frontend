'use client'

import { useState } from 'react'
import { httpClient } from '@/lib/api/http'

export default function CookieDebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [email, setEmail] = useState('aq@gmail.com')
  const [password, setPassword] = useState('')

  const addResult = (step: string, status: 'success' | 'error', data: any) => {
    setResults(prev => [...prev, { step, status, data, timestamp: new Date().toISOString() }])
  }

  const testCookieFlow = async () => {
    setResults([])
    
    try {
      // Step 1: Login
      addResult('1. Login Request', 'success', 'Sending login request...')
      const loginResponse = await httpClient.post('/auth/login', { email, password })
      addResult('1. Login Response', 'success', loginResponse)

      // Step 2: Check cookie endpoint
      await new Promise(resolve => setTimeout(resolve, 200))
      addResult('2. Cookie Check', 'success', 'Checking if backend receives cookie...')
      const cookieCheck = await httpClient.get('/auth/check-cookie')
      addResult('2. Cookie Check Response', 'success', cookieCheck)

      // Step 3: Get profile
      await new Promise(resolve => setTimeout(resolve, 200))
      addResult('3. Profile Request', 'success', 'Fetching user profile...')
      const profileResponse = await httpClient.get('/auth/me')
      addResult('3. Profile Response', 'success', profileResponse)

      addResult('✅ Complete', 'success', 'All tests passed! Cookie authentication working.')
    } catch (error: any) {
      addResult('❌ Error', 'error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🍪 Cookie Authentication Debugger</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              onClick={testCookieFlow}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Run Cookie Test
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {results.length === 0 && (
            <p className="text-gray-500">No tests run yet. Click "Run Cookie Test" to start.</p>
          )}
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded ${
                  result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="font-semibold mb-2">
                  {result.status === 'success' ? '✅' : '❌'} {result.step}
                </div>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">🔍 How to Debug:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open Browser DevTools (F12)</li>
            <li>Go to Application/Storage → Cookies → http://localhost:3000</li>
            <li>Look for <code className="bg-yellow-100 px-1">access_token</code> cookie</li>
            <li>Check if it has: HttpOnly, SameSite=Lax, Path=/</li>
            <li>After login, cookie should appear in the list</li>
            <li>Check Network tab → Request Headers for subsequent requests</li>
            <li>Cookie header should be present in requests to localhost:8000</li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">⚙️ Configuration Check:</h3>
          <ul className="space-y-1 text-sm">
            <li>✓ Frontend: withCredentials: true</li>
            <li>✓ Backend: credentials: true in CORS</li>
            <li>✓ Backend: origin: 'http://localhost:3000'</li>
            <li>✓ Cookie: httpOnly, sameSite: 'lax', secure: false</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
