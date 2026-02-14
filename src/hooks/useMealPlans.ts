import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { mealPlansApi } from '@/lib/api/meal-plans';
import type {
  CreateMealPlanInput,
  MealPlanQuery,
  UpdateMealPlanInput,
} from '@/lib/validation/schemas/meal-plan';

export const useMealPlans = (params?: MealPlanQuery) => {
  return useQuery({
    queryKey: ['meal-plans', params],
    queryFn: () => mealPlansApi.getAll(params),
  });
};

export const useMealPlan = (id: string) => {
  return useQuery({
    queryKey: ['meal-plans', id],
    queryFn: () => mealPlansApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMealPlanInput) => mealPlansApi.create(data),
    onSuccess: () => {
      toast.success('Meal plan added');
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add meal plan: ${error.message}`);
    },
  });
};

export const useUpdateMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMealPlanInput }) =>
      mealPlansApi.update(id, data),
    onSuccess: () => {
      toast.success('Meal plan updated');
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update meal plan: ${error.message}`);
    },
  });
};

export const useDeleteMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mealPlansApi.delete(id),
    onSuccess: () => {
      toast.success('Meal plan removed');
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove meal plan: ${error.message}`);
    },
  });
};
