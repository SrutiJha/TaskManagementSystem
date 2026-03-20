'use client';

import { useState, useCallback } from 'react';
import { Plus, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { Task, TaskStatus, Priority } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import TaskForm from '@/components/tasks/TaskForm';
import DeleteDialog from '@/components/tasks/DeleteDialog';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useRef } from 'react';

export default function TasksPage() {
  const { tasks, pagination, filters, isLoading, updateFilters, createTask, updateTask, deleteTask, toggleTask } =
    useTasks({ limit: 12 });

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  const searchRef = useRef(false);
  useEffect(() => {
    if (!searchRef.current) { searchRef.current = true; return; }
    updateFilters({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch, updateFilters]);

  const handleCreate = useCallback(
    async (data: Parameters<typeof createTask>[0]) => {
      try {
        await createTask(data);
        setShowForm(false);
      } catch {
        toast.error('Failed to create task');
      }
    },
    [createTask]
  );

  const handleUpdate = useCallback(
    async (data: Parameters<typeof createTask>[0]) => {
      if (!editingTask) return;
      try {
        await updateTask(editingTask.id, data);
        setEditingTask(null);
      } catch {
        toast.error('Failed to update task');
      }
    },
    [editingTask, updateTask]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingTask, deleteTask]);

  const handleToggle = useCallback(
    async (task: Task) => {
      try {
        await toggleTask(task.id);
      } catch {
        toast.error('Failed to update status');
      }
    },
    [toggleTask]
  );

  const activeFilterCount = [filters.status, filters.priority].filter(Boolean).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">My Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {pagination ? `${pagination.total} task${pagination.total !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); updateFilters({ search: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={filters.status ?? ''}
          onChange={(e) => updateFilters({ status: (e.target.value as TaskStatus) || undefined })}
          className="input-field w-auto sm:w-40"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority ?? ''}
          onChange={(e) => updateFilters({ priority: (e.target.value as Priority) || undefined })}
          className="input-field w-auto sm:w-36"
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Sort */}
        <select
          value={`${filters.sortBy ?? 'createdAt'}:${filters.sortOrder ?? 'desc'}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(':');
            updateFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
          }}
          className="input-field w-auto sm:w-44"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="dueDate:asc">Due date ↑</option>
          <option value="title:asc">Title A–Z</option>
          <option value="priority:desc">Priority ↑</option>
        </select>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={13} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.status && (
            <button
              onClick={() => updateFilters({ status: undefined })}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            >
              {filters.status.replace('_', ' ')} <X size={10} />
            </button>
          )}
          {filters.priority && (
            <button
              onClick={() => updateFilters({ priority: undefined })}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            >
              {filters.priority} <X size={10} />
            </button>
          )}
          <button
            onClick={() => updateFilters({ status: undefined, priority: undefined })}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Task grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="flex gap-3">
                <div className="skeleton w-5 h-5 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="flex gap-2 mt-1">
                    <div className="skeleton h-5 w-16 rounded-full" />
                    <div className="skeleton h-5 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-muted-foreground/50" />
          </div>
          <p className="font-medium mb-1">No tasks found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
          {!filters.search && !filters.status && !filters.priority && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={15} /> New Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={(id) => setDeletingTask(tasks.find((t) => t.id === id) ?? null)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateFilters({ page: pagination.page - 1 })}
              disabled={!pagination.hasPrev}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {/* Page numbers */}
            <div className="flex gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => updateFilters({ page })}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      pagination.page === page
                        ? 'bg-primary text-primary-foreground'
                        : 'btn-secondary'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => updateFilters({ page: pagination.page + 1 })}
              disabled={!pagination.hasNext}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {deletingTask && (
        <DeleteDialog
          taskTitle={deletingTask.title}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
