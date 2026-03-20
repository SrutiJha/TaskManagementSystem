import apiClient from '@/lib/api-client';
import { AuthResponse, ApiResponse } from '@/types';

export const authApi = {
  register: async (email: string, name: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', {
      email, name, password,
    });
    return data.data!;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      email, password,
    });
    return data.data!;
  },

  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data.data;
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },
};
