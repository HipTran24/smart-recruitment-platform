import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

type CandidateSidebarProps = {
  isSettingsOpen: boolean;
  onSettingsClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
};

export const CandidateSidebar = ({
  isSettingsOpen,
  onSettingsClick,
  isOpen = false,
  onClose,
}: CandidateSidebarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  return (
    <aside
      className={`fixed lg:relative inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-4 pb-4 pt-6 select-none h-full transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Brand & Mobile Close */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-emerald-200">
              S
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight block leading-tight">
                SmartRecruit
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 tracking-wide uppercase">
                Candidate Portal
              </span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="lg:hidden p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex w-full flex-col gap-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Applicant Space
          </div>
          <CandidateNavLink
            to="/my-applications"
            label="My Applications"
            onClick={onClose}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <CandidateNavLink
            to="/explore-jobs"
            label="Explore Jobs"
            onClick={onClose}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <CandidateNavLink
            to="/profile-resume"
            label="My Profile & Resume"
            onClick={onClose}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <CandidateNavLink
            to="/interviews-offers"
            label="Interviews & Offers"
            onClick={onClose}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onSettingsClick();
            }}
            aria-pressed={isSettingsOpen}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
              isSettingsOpen
                ? "bg-emerald-50 font-semibold text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 shrink-0 text-slate-400"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a7.8 7.8 0 0 1-1.4.8l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.4-.8l-1.7.7-1.4-2.4 1.4-1.1a7.1 7.1 0 0 1 0-1.7l-1.4-1.1 1.4-2.4 1.7.7a7.8 7.8 0 0 1 1.4-.8l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.4.8l1.7-.7 1.4 2.4-1.4 1.1a7.1 7.1 0 0 1 0 1.7Z" />
            </svg>
            <span>Candidate Settings</span>
          </button>
        </nav>
      </div>

      {/* Candidate Profile Footer with Logout */}
      <div className="border-t border-slate-200 p-2 pt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-slate-800 truncate">{user?.fullName || 'Ứng Viên'}</div>
            <div className="text-emerald-600 text-[10px] font-medium truncate">{user?.email || 'candidate@smartrecruit.local'}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

type CandidateNavLinkProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

function CandidateNavLink({ to, label, icon, onClick }: CandidateNavLinkProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
          isActive
            ? "bg-emerald-50 text-emerald-700 font-semibold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={isActive ? "text-emerald-600" : "text-slate-400"}>
              {icon}
            </span>
            <span className="truncate">{label}</span>
          </div>
          {isActive && (
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
}
