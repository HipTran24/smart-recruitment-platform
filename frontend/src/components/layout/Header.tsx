import { useLocation } from 'react-router-dom';
import { SearchInput } from '../ui/Input';
import { RoleSwitcher } from './RoleSwitcher';

const routeLabels: Record<string, { breadcrumbs: string[]; title: string }> = {
  '/': { breadcrumbs: ['Workspace', 'Admin Console', 'Overview'], title: 'Overview' },
  '/jobs': { breadcrumbs: ['Workspace', 'Jobs'], title: 'Jobs' },
  '/candidates': { breadcrumbs: ['Workspace', 'Candidates'], title: 'Candidates' },
  '/applications': { breadcrumbs: ['Workspace', 'Application Management'], title: 'Applications' },
  '/user-directory': { breadcrumbs: ['Workspace', 'User Directory'], title: 'User Directory' },
  '/users-roles': { breadcrumbs: ['Workspace', 'Admin Console', 'Users & Roles'], title: 'Users & Roles' },
  '/skill-taxonomy': { breadcrumbs: ['Workspace', 'Admin Console', 'Skill Taxonomy'], title: 'Skill Taxonomy' },
  '/audit': { breadcrumbs: ['Workspace', 'Admin Console', 'Audit Event Explorer'], title: 'Audit Event Explorer' },
  '/settings': { breadcrumbs: ['Workspace', 'Administration', 'Settings & AI Configuration'], title: 'Settings' },
  '/admin-console': { breadcrumbs: ['Workspace', 'Admin Console', 'Overview'], title: 'Admin Console' },
};

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const info = routeLabels[location.pathname] ?? { breadcrumbs: ['Workspace'], title: location.pathname.slice(1) };

  return (
    <header className="fixed top-0 left-0 lg:left-[220px] right-0 h-12 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4 sm:px-6 z-30 shadow-2xs">
      {/* Left side: Hamburger button + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] min-w-0">
          {info.breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span className="opacity-40">/</span>}
              <span className={`${i === info.breadcrumbs.length - 1 ? 'text-[var(--color-text-primary)] font-semibold' : 'text-[var(--color-text-secondary)]'} truncate`}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <RoleSwitcher variant="header" />
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold">Live Sync</span>
        </div>
      </div>
    </header>
  );
}
