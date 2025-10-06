import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars.api'
import { Car } from '@/types'

export function useDriverCars() {
  const queryClient = useQueryClient()

  const { data: cars, isLoading } = useQuery({
    queryKey: ['driver-cars'],
    queryFn: carsApi.getAll, // This should be modified to get driver's own cars
  })

  const createCar = useMutation({
    mutationFn: (car: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => 
      carsApi.create(car),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-cars'] })
    },
  })

  const updateCar = useMutation({
    mutationFn: ({ id, car }: { id: string; car: Partial<Car> }) => 
      carsApi.update(id, car),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-cars'] })
    },
  })

  const deleteCar = useMutation({
    mutationFn: (id: string) => carsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-cars'] })
    },
  })

  return {
    cars,
    isLoading,
    createCar: createCar.mutateAsync,
    updateCar: updateCar.mutateAsync,
    deleteCar: deleteCar.mutateAsync,
  }
}
