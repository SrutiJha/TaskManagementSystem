import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
}

export interface TaskQueryParams {
  page?: string;
  limit?: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
