import type {
  CreateMealPlanInput,
  MealPlanQuery,
  UpdateMealPlanInput,
} from '@/lib/validation/schemas/meal-plan';
import type { MealPlanWithDetails } from '@/repositories/interfaces/meal-plan-repository.interface';

import { api } from './client';

export interface MealPlanListResponse {
  success: boolean;
  data: MealPlanWithDetails[];
}

export interface MealPlanResponse {
  success: boolean;
  data: MealPlanWithDetails;
}

export const mealPlansApi = {
  getAll: async (params?: MealPlanQuery) => {
    const queryString = new URLSearchParams();
    if (params) {
      if (params.startDate)
        queryString.append('startDate', params.startDate.toISOString());
      if (params.endDate)
        queryString.append('endDate', params.endDate.toISOString());
      if (params.mealType) queryString.append('mealType', params.mealType);
      if (params.isCompleted !== undefined)
        queryString.append('isCompleted', String(params.isCompleted));
    }
    return api.get<MealPlanListResponse>(
      `/meal-plans?${queryString.toString()}`
    );
  },

  getById: async (id: string) => {
    return api.get<MealPlanResponse>(`/meal-plans/${id}`);
  },

  create: async (data: CreateMealPlanInput) => {
    return api.post<MealPlanResponse>('/meal-plans', data);
  },

  update: async (id: string, data: UpdateMealPlanInput) => {
    return api.patch<MealPlanResponse>(`/meal-plans/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete<void>(`/meal-plans/${id}`);
  },
};
