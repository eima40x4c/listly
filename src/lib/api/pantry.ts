import type {
  CreatePantryItemInput,
  PantryItemQuery,
  UpdatePantryItemInput,
} from '@/lib/validation/schemas/pantry-item';
import type { PantryItemWithDetails } from '@/repositories/interfaces/pantry-repository.interface';

import { api } from './client';

export interface PantryListResponse {
  success: boolean;
  data: PantryItemWithDetails[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PantryItemResponse {
  success: boolean;
  data: PantryItemWithDetails;
}

export const pantryApi = {
  getAll: async (
    params?: PantryItemQuery & { page?: number; limit?: number }
  ) => {
    const queryString = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, String(value));
        }
      });
    }
    return api.get<PantryListResponse>(`/pantry?${queryString.toString()}`);
  },

  getById: async (id: string) => {
    return api.get<PantryItemResponse>(`/pantry/${id}`);
  },

  create: async (data: CreatePantryItemInput) => {
    return api.post<PantryItemResponse>('/pantry', data);
  },

  update: async (id: string, data: UpdatePantryItemInput) => {
    return api.patch<PantryItemResponse>(`/pantry/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete<void>(`/pantry/${id}`);
  },
};
