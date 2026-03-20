import apiClient from '@/lib/api-client';
import { Task, PaginatedTasks, TaskFilters, TaskStats, ApiResponse } from '@/types';

export const tasksApi = {
  getTasks: async (filters: TaskFilters = {}): Promise<PaginatedTasks> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const { data } = await apiClient.get<ApiResponse<PaginatedTasks>>(
      `/tasks?${params.toString()}`
    );
    return data.data!;
  },

  getTask: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data!;
  },

  createTask: async (payload: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  }): Promise<Task> => {
    const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
    return data.data!;
  },

  updateTask: async (
    id: string,
    payload: Partial<{
      title: string;
      description: string | null;
      status: string;
      priority: string;
      dueDate: string | null;
    }>
  ): Promise<Task> => {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data.data!;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  toggleTask: async (id: string): Promise<Task> => {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/toggle`);
    return data.data!;
  },

  getStats: async (): Promise<TaskStats> => {
    const { data } = await apiClient.get<ApiResponse<TaskStats>>('/tasks/stats');
    return data.data!;
  },
};
