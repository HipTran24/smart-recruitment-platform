interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange, label }: PaginationProps) {
  const start = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const end = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a2a]">
      <span className="text-xs text-zinc-500">
        {label ?? (totalItems && start && end ? `Showing ${start}–${end} of ${totalItems.toLocaleString()} ${totalItems === 1 ? 'record' : 'records'}` : '')}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-xs text-zinc-400 border border-zinc-700 rounded-md hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 text-xs rounded-md transition-colors ${currentPage === page ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:bg-zinc-800'}`}
            >
              {page}
            </button>
          );
        })}
        {totalPages > 5 && <span className="text-zinc-500 text-xs px-1">...</span>}
        {totalPages > 5 && (
          <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 text-xs text-zinc-400 hover:bg-zinc-800 rounded-md transition-colors">
            {totalPages.toLocaleString()}
          </button>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-xs text-zinc-400 border border-zinc-700 rounded-md hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
