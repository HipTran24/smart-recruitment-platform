interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs text-[var(--color-text-primary)] transition-all ${
        onClick ? 'cursor-pointer hover:bg-[var(--color-surface-hover)] hover:shadow-xs' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changePositive,
  subtitle,
  badge,
  badgeColor,
  icon,
  className = '',
}: MetricCardProps) {
  return (
    <Card className={`p-5 flex flex-col justify-between gap-3 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-[var(--color-text-muted)] shrink-0">{icon}</span>}
        {badge && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 border ${
              badgeColor ?? 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] tabular-nums leading-none">
            {value}
          </span>
          {change && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                changePositive !== false
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {change}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
