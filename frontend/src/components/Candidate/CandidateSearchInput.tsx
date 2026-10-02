import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type CandidateSearchInputProps = {
  className?: string;
};

export function CandidateSearchInput({
  className = "",
}: CandidateSearchInputProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = query.trim();
    navigate(
      search
        ? `/explore-jobs?search=${encodeURIComponent(search)}`
        : "/explore-jobs",
    );
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative flex h-10 w-64 shrink-0 items-center ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        aria-label="Search jobs and skills"
        placeholder="Search jobs and skills..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-full w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        aria-label="Search jobs"
        title="Search jobs"
        className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
