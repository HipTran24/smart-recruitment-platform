import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 pb-6 border-b border-[var(--color-border)]/60 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              {idx > 0 && <span className="text-[var(--color-text-muted)] opacity-50">/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[var(--color-text-primary)] font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] font-['Inter',sans-serif]">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
