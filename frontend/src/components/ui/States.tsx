import { Button } from './Button';

interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  message = 'Loading data...',
  description,
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-9 h-9 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand)] animate-spin" />
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{message}</p>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = 'No records found',
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 py-16 px-6 text-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 ${className}`}
    >
      {icon ?? (
        <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      <div className="max-w-md">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 py-16 px-6 text-center rounded-xl border border-red-500/20 bg-red-500/5 ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="max-w-md">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function FilterBar({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {children}
    </div>
  );
}
