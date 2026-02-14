import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { pantryApi } from '@/lib/api/pantry';
import type {
  CreatePantryItemInput,
  PantryItemQuery,
  UpdatePantryItemInput,
} from '@/lib/validation/schemas/pantry-item';

export const usePantry = (
  params?: PantryItemQuery & { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ['pantry', params],
    queryFn: () => pantryApi.getAll(params),
  });
};

export const usePantryItem = (id: string) => {
  return useQuery({
    queryKey: ['pantry', id],
    queryFn: () => pantryApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePantryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePantryItemInput) => pantryApi.create(data),
    onSuccess: () => {
      toast.success('Item added to pantry');
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });
};

export const useUpdatePantryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePantryItemInput }) =>
      pantryApi.update(id, data),
    onSuccess: () => {
      toast.success('Pantry item updated');
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
};

export const useDeletePantryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pantryApi.delete(id),
    onSuccess: () => {
      toast.success('Item removed from pantry');
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove item: ${error.message}`);
    },
  });
};
