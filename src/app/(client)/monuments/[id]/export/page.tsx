'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useExport } from '@/features/monuments/useExport'

export default function MonumentExportPage() {
  const params = useParams()
  const monumentId = params.id as string
  
  const [exportFormat, setExportFormat] = useState<'pdf' | 'html' | 'json'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  
  const { exportMonument } = useExport()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportMonument(monumentId, exportFormat)
      // The export function should handle the download
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatDescriptions = {
    pdf: 'Download as a formatted PDF document with images and detailed information',
    html: 'Download as an HTML file that can be viewed in any web browser',
    json: 'Download as a JSON file containing all monument data for developers'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Export Monument Information
          </h1>
          <p className="text-lg text-gray-600">
            Choose your preferred format to download the monument details and information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['pdf', 'html', 'json'] as const).map((format) => (
                  <label
                    key={format}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      exportFormat === format
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={exportFormat === format}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {format === 'pdf' && '📄'}
                        {format === 'html' && '🌐'}
                        {format === 'json' && '📋'}
                      </div>
                      <div className="font-semibold text-gray-900 uppercase">
                        {format}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {exportFormat.toUpperCase()} Format
              </h3>
              <p className="text-sm text-gray-600">
                {formatDescriptions[exportFormat]}
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Export Includes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Monument name and description</li>
            <li>• Historical information and significance</li>
            <li>• Location details and coordinates</li>
            <li>• Architectural style and period</li>
            <li>• High-quality images</li>
            <li>• Recognition metadata</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
