import { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] border border-transparent shadow-xs font-semibold',
  secondary: 'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] shadow-2xs font-medium',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-transparent font-medium',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-xs font-semibold',
  outline: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] font-medium',
};

const sizeClasses: Record<string, string> = {
  sm: 'min-h-[34px] px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'min-h-[40px] px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'min-h-[44px] px-5 py-2.5 text-base rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  isLoading = false,
  loadingText,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] ${variantClasses[variant] ?? variantClasses.primary} ${sizeClasses[size] ?? sizeClasses.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0 flex items-center justify-center">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
