'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Task } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
}

export default function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    } else {
      reset({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
    }
  }, [task, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 className="font-display text-xl font-semibold">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="What needs to be done?"
              className="input-field"
              autoFocus
            />
            {errors.title && (
              <p className="text-destructive text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add more details…"
              className="input-field resize-none"
            />
            {errors.description && (
              <p className="text-destructive text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select {...register('status')} className="input-field">
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <select {...register('priority')} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Due Date</label>
            <input {...register('dueDate')} type="date" className="input-field" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                  </svg>
                  Saving…
                </span>
              ) : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
