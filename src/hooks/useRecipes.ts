import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { recipesApi } from '@/lib/api/recipes';
import type {
  CreateRecipeInput,
  RecipeQuery,
  UpdateRecipeInput,
} from '@/lib/validation/schemas/recipe';

export const useRecipes = (
  params?: RecipeQuery & { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipesApi.getAll(params),
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecipeInput) => recipesApi.create(data),
    onSuccess: () => {
      toast.success('Recipe created');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create recipe: ${error.message}`);
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipeInput }) =>
      recipesApi.update(id, data),
    onSuccess: () => {
      toast.success('Recipe updated');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update recipe: ${error.message}`);
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: () => {
      toast.success('Recipe deleted');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete recipe: ${error.message}`);
    },
  });
};
