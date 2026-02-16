'use client'

import React, { Component, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
