'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useDisputesAdmin } from '@/features/admin/useDisputesAdmin'

export default function AdminDisputesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'>('all')
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolution, setResolution] = useState('')
  
  const { disputes, isLoading, resolveDispute } = useDisputesAdmin()

  const filteredDisputes = disputes?.filter(dispute => {
    const matchesSearch = dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (dispute.reason && dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleResolveDispute = async (disputeId: string) => {
    if (!resolution.trim()) {
      alert('Please provide a resolution before resolving the dispute.')
      return
    }
    
    try {
      await resolveDispute({ disputeId, resolution })
      setSelectedDispute(null)
      setResolution('')
    } catch (error) {
      console.error('Failed to resolve dispute:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dispute Resolution
        </h1>
        <p className="text-lg text-gray-600">
          Review and resolve customer disputes and complaints.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            label="Search Disputes"
            placeholder="Search by ID, booking, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900">{disputes?.length || 0}</p>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Open Disputes</p>
                <p className="text-2xl font-bold text-red-600">
                  {disputes?.filter(d => d.status === 'OPEN').length || 0}
                </p>
              </div>
              <div className="text-2xl">🔴</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {disputes?.filter(d => d.status === 'IN_REVIEW').length || 0}
                </p>
              </div>
              <div className="text-2xl">🟡</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {disputes?.filter(d => d.status === 'RESOLVED').length || 0}
                </p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredDisputes.length > 0 ? (
          filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="font-semibold text-lg">#{dispute.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {dispute.bookingType}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">Reason: {dispute.reason}</h4>
                      <p className="text-sm text-gray-600">{dispute.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Booking ID:</span> {dispute.bookingId}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {formatDate(dispute.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">User ID:</span> {dispute.userId}
                      </div>
                    </div>

                    {dispute.resolution && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900 mb-1">Resolution:</h5>
                        <p className="text-sm text-green-800">{dispute.resolution}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Resolved on {dispute.updatedAt && formatDate(dispute.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    {dispute.status === 'OPEN' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedDispute(dispute)}
                        >
                          Review Dispute
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDispute(dispute)}
                        >
                          Start Resolution
                        </Button>
                      </>
                    )}
                    {dispute.status === 'IN_REVIEW' && (
                      <Button 
                        size="sm"
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        Add Resolution
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">
                ⚠️ No disputes found
              </div>
              <p className="text-gray-400">
                {searchQuery || statusFilter !== 'all' 
                  ? "No disputes match your search criteria."
                  : "No disputes have been reported yet."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Resolve Dispute #{selectedDispute.id}</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedDispute(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Dispute Details:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Reason:</span> {selectedDispute.reason}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Description:</span> {selectedDispute.description}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Booking ID:</span> {selectedDispute.bookingId}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe how you resolved this dispute..."
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={() => handleResolveDispute(selectedDispute.id)}
                  className="flex-1"
                  disabled={!resolution.trim()}
                >
                  Resolve Dispute
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDispute(null)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
