import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import { listKeys } from './useLists';

// Types
interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ListItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  estimatedPrice?: number;
  actualPrice?: number;
  notes?: string;
  priority?: number;
  category?: Category;
  addedBy?: User;
  checkedBy?: User;
  checkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ItemsResponse {
  success: true;
  data: ListItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ItemResponse {
  success: true;
  data: ListItem;
}

interface CreateItemData {
  name: string;
  quantity?: number;
  unit?: string;
  estimatedPrice?: number;
  notes?: string;
  categoryId?: string;
}

interface UpdateItemData {
  name?: string;
  quantity?: number;
  unit?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  notes?: string;
  categoryId?: string;
  isChecked?: boolean;
}

interface BulkAddItemsData {
  items: string[];
}

// Query keys factory
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (listId: string) => [...itemKeys.lists(), listId] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (listId: string, itemId: string) =>
    [...itemKeys.details(), listId, itemId] as const,
};

// Hooks
export function useListItems(listId: string) {
  return useQuery({
    queryKey: itemKeys.list(listId),
    queryFn: async () => {
      const response = await api.get<ItemsResponse>(`/lists/${listId}/items`);
      return response.data;
    },
    enabled: !!listId,
  });
}

export function useListItem(listId: string, itemId: string) {
  return useQuery({
    queryKey: itemKeys.detail(listId, itemId),
    queryFn: () => api.get<ItemResponse>(`/lists/${listId}/items/${itemId}`),
    enabled: !!listId && !!itemId,
  });
}

export function useCreateItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateItemData) => {
      const response = await api.post<ItemResponse>(
        `/lists/${listId}/items`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}

export function useBulkAddItems(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAddItemsData) =>
      api.post<ItemsResponse>(`/lists/${listId}/items/bulk`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}

export function useUpdateItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateItemData;
    }) => {
      const response = await api.patch<ItemResponse>(`/items/${itemId}`, data);
      return response.data;
    },
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(listId, itemId),
      });
      queryClient.invalidateQueries({ queryKey: itemKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}

export function useCheckItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      checked,
    }: {
      itemId: string;
      checked: boolean;
    }) => {
      const response = await api.patch<ItemResponse>(`/items/${itemId}`, {
        isChecked: checked,
      });
      return response.data;
    },
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(listId, itemId),
      });
      queryClient.invalidateQueries({ queryKey: itemKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}

export function useDeleteItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => api.delete(`/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}

export function useClearCompletedItems(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.delete<{ success: true; data: { deletedCount: number } }>(
        `/lists/${listId}/items/completed`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}
