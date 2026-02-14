import type {
  CreateRecipeInput,
  RecipeQuery,
  UpdateRecipeInput,
} from '@/lib/validation/schemas/recipe';
import type { RecipeWithDetails } from '@/repositories/interfaces/recipe-repository.interface';

import { api } from './client';

export interface RecipeListResponse {
  success: boolean;
  data: RecipeWithDetails[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecipeResponse {
  success: boolean;
  data: RecipeWithDetails;
}

export const recipesApi = {
  getAll: async (params?: RecipeQuery & { page?: number; limit?: number }) => {
    const queryString = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, String(value));
        }
      });
    }
    return api.get<RecipeListResponse>(`/recipes?${queryString.toString()}`);
  },

  getById: async (id: string) => {
    return api.get<RecipeResponse>(`/recipes/${id}`);
  },

  create: async (data: CreateRecipeInput) => {
    return api.post<RecipeResponse>('/recipes', data);
  },

  update: async (id: string, data: UpdateRecipeInput) => {
    return api.patch<RecipeResponse>(`/recipes/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete<void>(`/recipes/${id}`);
  },
};
