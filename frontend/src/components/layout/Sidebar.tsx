import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    path: "/",
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
    path: "/jobs",
    label: "Jobs",
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
          d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
        />
      </svg>
    ),
  },
  {
    path: "/candidates",
    label: "Candidates",
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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    path: "/applications",
    label: "Applications",
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
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

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-[#111111] border-r border-[#1e1e1e] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="black">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm font-['Geist',sans-serif]">
            SmartRecruit
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-[#1e1e1e] text-white font-medium"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-zinc-500"}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <span className="ml-auto w-1 h-1 rounded-full bg-white opacity-70" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-[#1e1e1e]">
        {bottomItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#1e1e1e] text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <span className={isActive ? "text-white" : "text-zinc-500"}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          );
        })}

        {/* Switch to Recruiter Portal */}
        <NavLink
          to="/recruiter"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 transition-colors mt-1 border border-blue-900/40"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Recruiter Workspace ➔
        </NavLink>

        {/* User */}
        <div className="mt-2 px-3 py-2 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            AJ
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              Alex Johnson
            </p>
            <p className="text-[10px] text-zinc-500 truncate">
              Senior Recruiter & Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
