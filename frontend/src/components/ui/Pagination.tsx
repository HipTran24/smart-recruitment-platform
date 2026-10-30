interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  const start = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const end = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] ${className}`}
    >
      <span className="text-xs font-medium tabular-nums">
        {label ??
          (totalItems && start && end
            ? `Showing ${start}–${end} of ${totalItems.toLocaleString()} ${
                totalItems === 1 ? 'record' : 'records'
              }`
            : `Page ${currentPage} of ${Math.max(totalPages, 1)}`)}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 min-h-[34px] px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            return (
              <button
                type="button"
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[34px] min-h-[34px] px-2.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[var(--color-brand)] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-transparent'
                }`}
              >
                {page}
              </button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="text-xs text-[var(--color-text-muted)] px-1">...</span>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className={`min-w-[34px] min-h-[34px] px-2.5 text-xs font-semibold rounded-lg transition-all ${
                  currentPage === totalPages
                    ? 'bg-[var(--color-brand)] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                {totalPages.toLocaleString()}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1 min-h-[34px] px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Next</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
