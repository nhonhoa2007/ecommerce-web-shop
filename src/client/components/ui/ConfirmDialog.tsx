'use client';

import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  secondaryAction?: { label: string; onClick: () => void; className?: string };
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', variant = 'default', loading = false, secondaryAction }: ConfirmDialogProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget && !loading) onClose();
  }}>
    <div role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onKeyDown={(event) => {
      if (event.key === 'Escape' && !loading) onClose();
    }}>
      <h2 id="admin-confirm-title" className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <div className="mt-2 text-sm text-slate-600">{description}</div>}
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border px-4 py-2 text-sm">{cancelLabel}</button>
        {secondaryAction && !loading && <button type="button" onClick={() => { onClose(); secondaryAction.onClick(); }} className={secondaryAction.className || 'rounded-lg border px-4 py-2 text-sm'}>{secondaryAction.label}</button>}
        <button type="button" onClick={onConfirm} disabled={loading} className={`rounded-lg px-4 py-2 text-sm text-white ${variant === 'danger' ? 'bg-red-700' : 'bg-slate-800'}`}>{loading ? 'Đang xử lý...' : confirmLabel}</button>
      </div>
    </div>
  </div>;
}
