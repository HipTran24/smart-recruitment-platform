import { useLocation } from 'react-router-dom';
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

export function Header() {
  const location = useLocation();
  const info = routeLabels[location.pathname] ?? { breadcrumbs: ['Workspace'], title: location.pathname.slice(1) };

  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center justify-between px-5 z-30">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0">
        {info.breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-zinc-700">›</span>}
            <span className={`${i === info.breadcrumbs.length - 1 ? 'text-zinc-200 font-medium' : 'text-zinc-500'} truncate`}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <SearchInput
          placeholder="Search logs, trace IDs, actors..."
          className="w-52"
        />
        <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors relative">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-[#0a0a0a]" />
        </button>
        <div className="flex items-center gap-1.5 bg-[#111] border border-[#2a2a2a] rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live Sync</span>
        </div>
      </div>
    </header>
  );
}
