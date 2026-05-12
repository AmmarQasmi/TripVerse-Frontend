import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

/**
 * Skeleton stat card (same size as real stat card)
 */
export function StatCardSkeleton() {
  return (
    <Card className="p-6 rounded-2xl bg-white border border-gray-200">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton stat cards grid (4 cards)
 */
export function StatCardsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton list row (matches driver/manager/dispute row layout)
 */
export function ListRowSkeleton() {
  return (
    <div className="p-6 bg-white border-b border-gray-200 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Avatar skeleton */}
          <div className="w-14 h-14 bg-gray-200 rounded-full" />
          
          {/* Text content skeleton */}
          <div className="flex-1">
            <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
            <div className="space-y-1">
              <div className="h-4 w-64 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Right side skeletons */}
        <div className="flex flex-col items-end space-y-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center p-3 bg-gray-100 rounded-lg">
            <div className="h-3 w-12 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-5 w-8 bg-gray-200 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton list with multiple rows
 */
export function ListRowsSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <Card className="border border-gray-200 shadow-sm rounded-xl bg-white text-gray-700">
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(count)].map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Modal skeleton (for dispute detail/document viewer)
 */
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-40 w-full bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Dashboard page skeleton
 */
export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="container mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stat cards */}
        <StatCardsSkeletonGrid />

        {/* List */}
        <ListRowsSkeletonGrid count={5} />
      </div>
    </div>
  )
}
