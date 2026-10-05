import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    path: "/admin-console",
    label: "Overview",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.75" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.75" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.75" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    path: "/user-directory",
    label: "User Directory",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    path: "/users-roles",
    label: "Users & Roles",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    path: "/skill-taxonomy",
    label: "Skill Taxonomy",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
  {
    path: "/audit",
    label: "Audit Event Explorer",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
];

const bottomItems: NavItem[] = [
  {
    path: "/settings",
    label: "Settings",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-[220px] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-40 transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo & Close button on mobile */}
      <div className="px-4 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <span className="text-[var(--color-text-primary)] font-bold text-sm tracking-tight block leading-tight">
              SmartRecruit
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Admin Console
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface-hover)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          System Administration
        </div>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/" || location.pathname === "/admin" || location.pathname === "/admin-console"
                : location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <span className={isActive ? "text-indigo-400" : "text-[var(--color-text-muted)]"}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom workspace switch & profile */}
      <div className="px-2.5 py-3 border-t border-[var(--color-border)] flex flex-col gap-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <span className={isActive ? "text-indigo-400" : "text-[var(--color-text-muted)]"}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          );
        })}

        {/* Switch to Recruiter Portal */}
        <NavLink
          to="/recruiter"
          onClick={() => onClose?.()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors mt-1 border border-blue-500/20"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>Recruiter Workspace</span>
          <span className="ml-auto text-xs">➔</span>
        </NavLink>

        {/* Switch to Candidate Portal */}
        <NavLink
          to="/my-applications"
          onClick={() => onClose?.()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors border border-emerald-500/20"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Candidate Portal</span>
          <span className="ml-auto text-xs">➔</span>
        </NavLink>

        {/* User Card */}
        <div className="mt-2 p-2 rounded-lg bg-[var(--color-surface-hover)]/40 flex items-center gap-2.5 border border-[var(--color-border)]/50">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            AJ
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate leading-tight">
              Alex Johnson
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate">
              Lead Admin & Architect
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
