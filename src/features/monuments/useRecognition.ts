import { useMutation } from '@tanstack/react-query'
import { monumentsApi } from '@/lib/api/monuments.api'
import { Monument } from '@/types'

interface RecognitionResult {
  monument: Monument
  confidence: number
}

export function useRecognition() {
  const recognizeMonument = useMutation({
    mutationFn: (imageFile: File) => monumentsApi.recognize(imageFile),
  })

  return {
    recognizeMonument: recognizeMonument.mutateAsync,
    data: recognizeMonument.data as RecognitionResult | undefined,
    isLoading: recognizeMonument.isPending,
    error: recognizeMonument.error,
  }
}
