'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, TaskFilters, PaginatedTasks, TaskStats } from '@/types';
import { tasksApi } from '@/lib/tasks-api';
import toast from 'react-hot-toast';

export function useTasks(initialFilters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginatedTasks['pagination'] | null>(null);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 10, ...initialFilters });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const fetchTasks = useCallback(async (f: TaskFilters) => {
    setIsLoading(true);
    try {
      const result = await tasksApi.getTasks(f);
      setTasks(result.data);
      setPagination(result.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const result = await tasksApi.getStats();
      setStats(result);
    } catch {
      // silently fail stats
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filters);
  }, [filters, fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateFilters = useCallback((updates: Partial<TaskFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      page: updates.page ?? 1,
    }));
  }, []);

  const createTask = useCallback(
    async (payload: Parameters<typeof tasksApi.createTask>[0]) => {
      const task = await tasksApi.createTask(payload);
      toast.success('Task created!');
      await fetchTasks(filters);
      await fetchStats();
      return task;
    },
    [filters, fetchTasks, fetchStats]
  );

  const updateTask = useCallback(
    async (id: string, payload: Parameters<typeof tasksApi.updateTask>[1]) => {
      const task = await tasksApi.updateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      toast.success('Task updated!');
      await fetchStats();
      return task;
    },
    [fetchStats]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await tasksApi.deleteTask(id);
      toast.success('Task deleted');
      await fetchTasks(filters);
      await fetchStats();
    },
    [filters, fetchTasks, fetchStats]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = await tasksApi.toggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      await fetchStats();
      return task;
    },
    [fetchStats]
  );

  return {
    tasks,
    pagination,
    stats,
    filters,
    isLoading,
    isStatsLoading,
    updateFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refetch: () => fetchTasks(filters),
  };
}
