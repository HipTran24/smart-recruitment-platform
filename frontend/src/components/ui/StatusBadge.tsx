import type { ApplicationStage, JobStatus, SkillStatus, UserStatus } from '../../types';

type BadgeVariant = 'active' | 'suspended' | 'pending' | 'published' | 'draft' | 'closed' | 'fill' |
  'interviewing' | 'applied' | 'offer' | 'rejected' | 'deprecated' | 'critical' | 'warn' | 'info' |
  'green' | 'orange' | 'red' | 'blue' | 'purple' | 'cyan' | 'gray' | 'pink' | string;

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const variantMap: Record<string, string> = {
  active: 'bg-green-500/15 text-green-400 border border-green-500/30',
  suspended: 'bg-red-500/15 text-red-400 border border-red-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  published: 'bg-green-500/15 text-green-400 border border-green-500/30',
  draft: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
  closed: 'bg-zinc-600/20 text-zinc-500 border border-zinc-600/30',
  fill: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  interviewing: 'bg-orange-500/80 text-white border-0',
  applied: 'bg-zinc-600/60 text-zinc-200 border-0',
  offer: 'bg-orange-500/80 text-white border-0',
  'offer sent': 'bg-orange-500/80 text-white border-0',
  'offer accepted': 'bg-green-600/80 text-white border-0',
  rejected: 'bg-red-600/70 text-white border-0',
  deprecated: 'bg-orange-500/80 text-white border-0',
  critical: 'bg-red-600/80 text-white border-0',
  warn: 'bg-orange-500/80 text-white border-0',
  info: 'bg-blue-600/40 text-blue-300 border border-blue-500/30',
  green: 'bg-green-500/15 text-green-400 border border-green-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  red: 'bg-red-500/15 text-red-400 border border-red-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  gray: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
  pink: 'bg-pink-500/15 text-pink-400 border border-pink-500/30',
  admin: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  recruiter: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  candidate: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
  'system admin': 'bg-red-500/20 text-red-300 border border-red-500/30',
  'lead recruiter': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'hiring manager': 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  'external recruiter': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  frontend: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  backend: 'bg-green-600/20 text-green-300 border border-green-600/30',
  devops: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  'data science': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  'soft skills': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  cloud: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
};

const dotColorMap: Record<string, string> = {
  active: 'bg-green-400',
  suspended: 'bg-red-400',
  published: 'bg-green-400',
  healthy: 'bg-green-400',
  degraded: 'bg-orange-400',
  down: 'bg-red-400',
};

export function StatusBadge({ variant = 'gray', label, dot, size = 'sm', className = '' }: StatusBadgeProps) {
  const key = (variant ?? '').toLowerCase();
  const classes = variantMap[key] ?? 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30';
  const dotColor = dotColorMap[key] ?? 'bg-zinc-400';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${sizeClasses} ${classes} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
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
  return <StatusBadge variant={key} label={stage} />;
}

export function skillStatusBadge(status: SkillStatus) {
  return <StatusBadge variant={status.toLowerCase()} label={status} dot />;
}
