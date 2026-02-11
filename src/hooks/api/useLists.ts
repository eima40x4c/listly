import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

// Types
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Store {
  id: string;
  name: string;
  chain?: string;
  address?: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  estimatedPrice?: number;
  actualPrice?: number;
  notes?: string;
  category?: Category;
  addedBy?: User;
  checkedBy?: User;
  checkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Collaborator {
  id: string;
  role: 'VIEWER' | 'EDITOR' | 'OWNER';
  joinedAt: string;
  user: User;
}

interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  isTemplate: boolean;
  color?: string;
  icon?: string;
  itemCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
  owner: User;
  store?: Store;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  items?: ListItem[];
  collaborators?: Collaborator[];
}

interface ListsResponse {
  success: true;
  data: ShoppingList[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ListResponse {
  success: true;
  data: ShoppingList;
}

interface ListFilters {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  sort?: string;
  order?: 'asc' | 'desc';
}

interface CreateListData {
  name: string;
  description?: string;
  budget?: number;
  storeId?: string;
  color?: string;
  icon?: string;
}

interface UpdateListData {
  name?: string;
  description?: string;
  budget?: number;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  storeId?: string;
  color?: string;
  icon?: string;
}

// Query keys factory
export const listKeys = {
  all: ['lists'] as const,
  lists: () => [...listKeys.all, 'list'] as const,
  list: (filters: ListFilters) => [...listKeys.lists(), filters] as const,
  details: () => [...listKeys.all, 'detail'] as const,
  detail: (id: string, include?: string) =>
    [...listKeys.details(), id, include] as const,
};

// Hooks
export function useLists(filters: ListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);

  const queryString = params.toString();
  const endpoint = `/lists${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: listKeys.list(filters),
    queryFn: async () => {
      const response = await api.get<ListsResponse>(endpoint);
      return response.data;
    },
  });
}

export function useList(id: string, include?: string) {
  const params = new URLSearchParams();
  if (include) params.set('include', include);

  const queryString = params.toString();
  const endpoint = `/lists/${id}${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: listKeys.detail(id, include),
    queryFn: async () => {
      const response = await api.get<ListResponse>(endpoint);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateListData) => {
      const response = await api.post<ListResponse>('/lists', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.lists() });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateListData }) => {
      const response = await api.patch<ListResponse>(`/lists/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listKeys.lists() });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/lists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.lists() });
    },
  });
}

export function useDuplicateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<ListResponse>(`/lists/${id}/duplicate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.lists() });
    },
  });
}

export function useCompleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<ListResponse>(`/lists/${id}/complete`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listKeys.lists() });
    },
  });
}

export function useArchiveList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<ListResponse>(`/lists/${id}/archive`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listKeys.lists() });
    },
  });
}
