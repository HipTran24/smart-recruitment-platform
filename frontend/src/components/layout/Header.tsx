import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { SearchInput } from '../ui/Input';

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const info = routeLabels[location.pathname] ?? { breadcrumbs: ['Workspace'], title: location.pathname.slice(1) };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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

      {/* Right side: Search + Live Status + User & Logout */}
      <div className="flex items-center gap-3 shrink-0">
        <SearchInput
          placeholder="Search logs, trace IDs..."
          className="hidden md:flex w-40 lg:w-48 text-xs"
        />

        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold">Live</span>
        </div>

        {/* User email badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-800/40 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-slate-300 font-medium truncate max-w-[160px]">{user?.email || 'admin@smartrecruit.local'}</span>
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
