interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl ${onClick ? 'cursor-pointer hover:bg-[#222] transition-colors' : ''} ${className}`}
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

export function MetricCard({ label, value, change, changePositive, subtitle, badge, badgeColor, icon, className = '' }: MetricCardProps) {
  return (
    <Card className={`p-5 flex flex-col gap-2 ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="text-zinc-500">{icon}</span>}
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeColor ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        <span className="text-3xl font-bold text-white font-['Geist',sans-serif] leading-none">{value}</span>
        {change && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${changePositive !== false ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && <span className="text-xs text-zinc-500">{subtitle}</span>}
    </Card>
  );
}
