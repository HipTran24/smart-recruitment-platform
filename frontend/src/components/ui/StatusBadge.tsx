import type { ApplicationStage, JobStatus, SkillStatus, UserStatus } from '../../types';

export type BadgeVariant =
  | 'active'
  | 'suspended'
  | 'pending'
  | 'published'
  | 'draft'
  | 'closed'
  | 'fill'
  | 'interviewing'
  | 'applied'
  | 'offer'
  | 'offer sent'
  | 'offer accepted'
  | 'rejected'
  | 'deprecated'
  | 'critical'
  | 'warn'
  | 'info'
  | 'ai-match'
  | 'ai-draft'
  | 'green'
  | 'orange'
  | 'red'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'gray'
  | 'pink'
  | string;

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label?: string;
  dot?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const variantMap: Record<string, string> = {
  // Operational & user status
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  healthy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  suspended: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
  pending: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30',
  published: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  draft: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30',
  closed: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30',
  fill: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30',

  // Application Pipeline stages
  applied: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30',
  screened: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  interviewing: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30',
  offer: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
  'offer stage': 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
  'offer sent': 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
  'offer accepted': 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',

  // AI Distinct Badges (Human-in-the-loop, separate from success/guarantee)
  'ai-match': 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
  'ai-draft': 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30',

  // Severity & Logs
  critical: 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 font-semibold',
  warn: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40',
  info: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  deprecated: 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border border-slate-500/30',

  // Semantic color variants
  green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  orange: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30',
  red: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
  blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30',
  gray: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30',
  pink: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-500/30',

  // Role taxonomy
  admin: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30',
  recruiter: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  candidate: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30',
  'system admin': 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
  'lead recruiter': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  'hiring manager': 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
};

const dotColorMap: Record<string, string> = {
  active: 'bg-emerald-500',
  healthy: 'bg-emerald-500',
  published: 'bg-emerald-500',
  suspended: 'bg-red-500',
  down: 'bg-red-500',
  critical: 'bg-red-500',
  degraded: 'bg-amber-500',
  pending: 'bg-amber-500',
  interviewing: 'bg-amber-500',
  applied: 'bg-slate-400',
  screened: 'bg-blue-500',
  'offer stage': 'bg-purple-500',
  offer: 'bg-purple-500',
};

export function StatusBadge({
  variant = 'gray',
  label,
  dot,
  icon,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const key = (variant ?? '').toLowerCase();
  const classes =
    variantMap[key] ??
    'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)]';
  const dotColor = dotColorMap[key] ?? 'bg-slate-400';
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap shadow-2xs ${sizeClasses} ${classes} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {label ?? variant}
    </span>
  );
}

export function userStatusBadge(status: UserStatus) {
  return <StatusBadge variant={status.toLowerCase()} label={status} dot />;
}

export function jobStatusBadge(status: JobStatus) {
  return <StatusBadge variant={status.toLowerCase()} label={status} />;
}

export function applicationStageBadge(stage: ApplicationStage) {
  const key = stage.toLowerCase();
  return <StatusBadge variant={key} label={stage} dot />;
}

export function skillStatusBadge(status: SkillStatus) {
  return <StatusBadge variant={status.toLowerCase()} label={status} dot />;
}

export function aiMatchBadge(score: number | string) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
      <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 011.342 1.341l-.8 1.6 1.582 3.954H20a1 1 0 010 2h-1.323l-1.582 3.954.8 1.6a1 1 0 01-1.341 1.342l-1.6-.8-3.954 1.582V20a1 1 0 01-2 0v-1.323l-3.954-1.582-1.6.8a1 1 0 01-1.342-1.341l.8-1.6L2 11.954V11a1 1 0 010-2h1.323l1.582-3.954-.8-1.6A1 1 0 015.446 2.1l1.6.8L11 3.323V2a1 1 0 01-1-1z" />
      </svg>
      {typeof score === 'number' ? `${score}% Match` : score}
    </span>
  );
}
