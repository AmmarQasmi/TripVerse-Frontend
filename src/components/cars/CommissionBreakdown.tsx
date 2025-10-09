'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface CommissionBreakdownProps {
  basePrice: number
  days: number
  extras: {
    gps?: number
    insurance?: number
    childSeat?: number
  }
  taxes?: number
}

export function CommissionBreakdown({ 
  basePrice, 
  days, 
  extras, 
  taxes = 0 
}: CommissionBreakdownProps) {
  const subtotal = basePrice * days
  const extrasTotal = Object.values(extras).reduce((sum, price) => sum + (price || 0), 0)
  const platformCommission = (subtotal + extrasTotal) * 0.05 // 5% platform fee
  const total = subtotal + extrasTotal + taxes + platformCommission

  const formatPrice = (price: number) => {
    return `PKR ${price.toLocaleString()}`
  }

  const breakdownItems = [
    {
      label: `Base Price (${days} ${days === 1 ? 'day' : 'days'})`,
      amount: subtotal,
      description: `PKR ${basePrice.toLocaleString()} × ${days} ${days === 1 ? 'day' : 'days'}`
    },
    ...(extras.gps ? [{
      label: 'GPS Navigation',
      amount: extras.gps,
      description: 'Optional GPS add-on'
    }] : []),
    ...(extras.insurance ? [{
      label: 'Comprehensive Insurance',
      amount: extras.insurance,
      description: 'Enhanced insurance coverage'
    }] : []),
    ...(extras.childSeat ? [{
      label: 'Child Safety Seat',
      amount: extras.childSeat,
      description: 'Child safety seat rental'
    }] : []),
    ...(taxes > 0 ? [{
      label: 'Taxes & Fees',
      amount: taxes,
      description: 'Government taxes and service fees'
    }] : []),
    {
      label: 'Platform Commission',
      amount: platformCommission,
      description: '5% TripVerse platform fee'
    }
  ]

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">💰</span>
          Price Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Breakdown Items */}
        <div className="space-y-3">
          {breakdownItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Total */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-lg font-bold text-gray-900">Total Amount</p>
            <p className="text-sm text-gray-500">All fees included</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(total)}
            </p>
          </div>
        </div>

        {/* Commission Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Transparent Pricing
              </h4>
              <p className="text-blue-800 text-sm">
                Our 5% platform commission helps us maintain service quality, 
                provide customer support, and ensure secure payments. 
                The driver receives 95% of the base rental amount.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Security */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-green-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                Secure Payment
              </h4>
              <p className="text-green-800 text-sm">
                Payment is processed securely through Stripe. 
                Your money is protected until your trip is completed.
              </p>
            </div>
          </div>
        </div>

        {/* Driver Earnings Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">
            Driver Earnings
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Driver receives:</p>
              <p className="font-semibold text-gray-900">
                {formatPrice(subtotal * 0.95)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">TripVerse commission:</p>
              <p className="font-semibold text-gray-900">
                {formatPrice(subtotal * 0.05)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
