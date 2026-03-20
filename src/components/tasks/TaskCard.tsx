'use client';

import { Task } from '@/types';
import { format } from 'date-fns';
import { MoreVertical, Pencil, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: Task) => void;
}

const statusConfig = {
  PENDING: { label: 'Pending', class: 'badge-pending' },
  IN_PROGRESS: { label: 'In Progress', class: 'badge-in-progress' },
  COMPLETED: { label: 'Done', class: 'badge-completed' },
};

const priorityConfig = {
  LOW: { label: 'Low', class: 'badge-low' },
  MEDIUM: { label: 'Medium', class: 'badge-medium' },
  HIGH: { label: 'High', class: 'badge-high' },
};

const nextStatus = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'PENDING',
} as const;

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const isOverdue =
    task.dueDate &&
    task.status !== 'COMPLETED' &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      className={cn(
        'card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group',
        task.status === 'COMPLETED' && 'opacity-70'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Toggle button */}
        <button
          onClick={() => onToggle(task)}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
            task.status === 'COMPLETED'
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : task.status === 'IN_PROGRESS'
              ? 'border-blue-400'
              : 'border-border hover:border-primary'
          )}
          title={`Mark as ${nextStatus[task.status].replace('_', ' ')}`}
        >
          {task.status === 'COMPLETED' && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {task.status === 'IN_PROGRESS' && (
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium leading-snug',
              task.status === 'COMPLETED' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className={statusConfig[task.status].class}>{statusConfig[task.status].label}</span>
            <span className={priorityConfig[task.priority].class}>{priorityConfig[task.priority].label}</span>
            {task.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs',
                  isOverdue ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                <Calendar size={11} />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-36 bg-card border border-border rounded-xl shadow-lg py-1 animate-slide-in">
              <button
                onClick={() => { onEdit(task); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Pencil size={13} className="text-muted-foreground" /> Edit
              </button>
              <button
                onClick={() => { onToggle(task); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <ChevronRight size={13} className="text-muted-foreground" /> Advance status
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => { onDelete(task.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
