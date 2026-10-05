import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, description, children, width = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${width} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl z-10 overflow-hidden text-[var(--color-text-primary)]`}
      >
        {title && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]/30">
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-[var(--color-text-primary)]">
                {title}
              </h2>
              {description && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5 max-h-[calc(100vh-160px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
