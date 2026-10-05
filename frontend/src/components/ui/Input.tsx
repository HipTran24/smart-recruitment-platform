import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--color-text-secondary)]">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`h-10 w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] rounded-lg px-3.5 py-2 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-[var(--color-text-muted)]">{helperText}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className = '', ...props }: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <svg
        className="absolute left-3.5 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        className="h-10 w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] rounded-lg pl-10 pr-3.5 py-2 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 disabled:opacity-50"
        {...props}
      />
    </div>
  );
}
