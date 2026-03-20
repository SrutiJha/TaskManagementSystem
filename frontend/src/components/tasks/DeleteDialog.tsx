'use client';

import { AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
  taskTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteDialog({ taskTitle, onConfirm, onCancel, isDeleting }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl animate-slide-in p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Delete task?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">This cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          You're about to delete <strong className="text-foreground">"{taskTitle}"</strong>.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1" disabled={isDeleting}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger flex-1" disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
