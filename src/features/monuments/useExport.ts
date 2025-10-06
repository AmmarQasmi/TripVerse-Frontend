import { useMutation } from '@tanstack/react-query'
import { monumentsApi } from '@/lib/api/monuments.api'

export function useExport() {
  const exportMonument = useMutation({
    mutationFn: ({ monumentId, format }: { monumentId: string; format: 'pdf' | 'html' | 'json' }) =>
      monumentsApi.export(monumentId, format),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `monument-${variables.monumentId}.${variables.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })

  return {
    exportMonument: exportMonument.mutateAsync,
    isLoading: exportMonument.isPending,
    error: exportMonument.error,
  }
}
