'use client';

import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle2, Circle, Clock, ListTodo, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Task } from '@/types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={17} />
        </div>
      </div>
      {isLoading ? (
        <div className="skeleton h-8 w-16 mb-1" />
      ) : (
        <p className="font-display text-3xl font-semibold">{value}</p>
      )}
      <p className="text-muted-foreground text-sm mt-0.5">{label}</p>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const statusClass =
    task.status === 'COMPLETED'
      ? 'badge-completed'
      : task.status === 'IN_PROGRESS'
      ? 'badge-in-progress'
      : 'badge-pending';
  const statusLabel =
    task.status === 'COMPLETED' ? 'Done' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Due {format(new Date(task.dueDate), 'MMM d')}
          </p>
        )}
      </div>
      <span className={statusClass}>{statusLabel}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, stats, isLoading, isStatsLoading } = useTasks({ limit: 5 });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, MMMM d')} — here's your overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Tasks"
          value={stats?.total ?? 0}
          icon={ListTodo}
          color="bg-blue-50 text-blue-600"
          isLoading={isStatsLoading}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={Circle}
          color="bg-amber-50 text-amber-600"
          isLoading={isStatsLoading}
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0}
          icon={Clock}
          color="bg-violet-50 text-violet-600"
          isLoading={isStatsLoading}
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
          isLoading={isStatsLoading}
        />
      </div>

      {/* Progress bar */}
      {stats && stats.total > 0 && (
        <div className="card p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Overall Progress</p>
            <p className="text-sm text-muted-foreground">
              {Math.round((stats.completed / stats.total) * 100)}% complete
            </p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>{stats.completed} done</span>
            <span>{stats.inProgress} in progress</span>
            <span>{stats.pending} pending</span>
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Tasks</h2>
          <Link href="/dashboard/tasks" className="btn-ghost text-xs gap-1.5">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10">
            <ListTodo size={32} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No tasks yet</p>
            <Link href="/dashboard/tasks" className="btn-primary mt-4 text-xs py-1.5 px-3">
              <Plus size={13} /> Create your first task
            </Link>
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
