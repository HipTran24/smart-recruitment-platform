import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/recruiter/console', label: 'Overview' },
  { path: '/recruiter/jobs', label: 'Jobs' },
  { path: '/recruiter/dashboard', label: 'Candidates' },
  { path: '/recruiter/console', label: 'Evaluations & Feedback' },
  { path: '/recruiter/console', label: 'Hiring Analytics' },
];

export function RecruiterSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200">
        <div className="w-7 h-7 bg-blue-50 text-blue-700 font-bold rounded flex items-center justify-center">S</div>
        <span className="font-bold text-lg text-slate-900">SmartRecruit</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);

            return (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1 h-5 bg-blue-600 rounded-full" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">AJ</div>
        <div>
          <div className="font-semibold text-sm text-slate-800">Alex Johnson</div>
          <div className="text-slate-500 text-xs">Hiring Manager</div>
        </div>
      </div>
    </aside>
  );
}
