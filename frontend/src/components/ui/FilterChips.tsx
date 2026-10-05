interface FilterItem {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterItem[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className = '',
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 ${className}`}>
      <span className="text-xs font-medium text-[var(--color-text-muted)]">Active filters:</span>
      {filters.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-brand-subtle)] text-[var(--color-brand-text)] border border-[var(--color-brand-border)] transition-all"
        >
          <span>
            <strong className="font-semibold">{item.label}:</strong> {item.value}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            aria-label={`Remove filter ${item.label}`}
            className="hover:opacity-75 focus:outline-hidden p-0.5 rounded-full"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-red-500 underline ml-1 cursor-pointer transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
