import { NavLink, useLocation, Link } from 'react-router-dom';

interface SubItem {
  path: string;
  label: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  {
    path: '/recruiter/console',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/recruiter/jobs',
    label: 'Jobs',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    children: [
      { path: '/recruiter/jobs', label: 'Requisitions' },
      { path: '/recruiter/jobs/create', label: 'Post New Job' },
    ],
  },
  {
    path: '/recruiter/candidates',
    label: 'Candidates',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    children: [
      { path: '/recruiter/candidates', label: 'Candidate Pipeline' },
      { path: '/recruiter/candidates/screening', label: 'Screening Hub' },
      { path: '/recruiter/candidates/detail', label: 'Candidate Dossier' },
    ],
  },
  {
    path: '/recruiter/evaluations',
    label: 'Evaluations & Feedback',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    children: [
      { path: '/recruiter/evaluations', label: 'Evaluation Approvals' },
      { path: '/recruiter/evaluations/ai-feedback', label: 'AI Feedback Drafts' },
    ],
  },
  {
    path: '/recruiter/calendar',
    label: 'Interview Calendar',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: '/recruiter/analytics',
    label: 'Hiring Analytics',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: '/recruiter/notifications',
    label: 'Notifications & Audit',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

export function RecruiterSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-200">
            S
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 tracking-tight block leading-tight">SmartRecruit</span>
            <span className="text-[10px] font-semibold text-blue-600 tracking-wide uppercase">Recruiter Workspace</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Recruitment Modules
        </div>

        {navItems.map((item) => {
          const isItemActive =
            location.pathname === item.path ||
            (item.path !== '/recruiter/console' && location.pathname.startsWith(item.path));

          return (
            <div key={item.label} className="space-y-0.5">
              <NavLink
                to={item.path}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isItemActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isItemActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {isItemActive && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
              </NavLink>

              {/* Sub items if active */}
              {item.children && isItemActive && (
                <div className="pl-7 pr-1 py-0.5 space-y-0.5">
                  {item.children.map((sub) => {
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={`block py-1 px-2.5 rounded-md text-[11px] transition-colors ${
                          isSubActive
                            ? 'font-bold text-blue-700 bg-blue-100/70'
                            : 'font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                        }`}
                      >
                        {sub.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Switch to Other Portals */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-1.5">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Admin Console</span>
        </Link>
        <Link
          to="/my-applications"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Candidate Portal</span>
        </Link>
      </div>

      {/* Recruiter Profile Footer */}
      <div className="border-t border-slate-200 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            AJ
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-slate-800 truncate">Alex Johnson</div>
            <div className="text-slate-400 text-[10px] truncate">Hiring Manager &amp; Recruiter</div>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
      </div>
    </aside>
  );
}
