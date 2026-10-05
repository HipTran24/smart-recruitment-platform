interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyFn,
  onRowClick,
  emptyMessage = 'No records found matching criteria',
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs ${className}`}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] sticky top-0 z-10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap ${
                  col.className ?? ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 px-4 text-sm text-[var(--color-text-muted)]"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg
                    className="w-8 h-8 text-[var(--color-text-muted)] opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyFn(row)}
                className={`text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors ${
                  onRowClick ? 'cursor-pointer active:bg-[var(--color-surface-hover)]' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-sm align-middle whitespace-nowrap ${col.className ?? ''}`}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
