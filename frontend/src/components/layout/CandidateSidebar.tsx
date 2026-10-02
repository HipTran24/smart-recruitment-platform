import { NavLink, Link } from "react-router-dom";

type CandidateSidebarProps = {
  isSettingsOpen: boolean;
  onSettingsClick: () => void;
};

export const CandidateSidebar = ({
  isSettingsOpen,
  onSettingsClick,
}: CandidateSidebarProps) => {
  return (
    <div className="relative flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-4 pb-4 pt-6 select-none h-full">
      <div className="flex flex-col gap-6 w-full">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2">
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

        {/* Navigation */}
        <nav className="flex w-full flex-col gap-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Applicant Space
          </div>
          <CandidateNavLink
            to="/my-applications"
            label="My Applications"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <CandidateNavLink
            to="/explore-jobs"
            label="Explore Jobs"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <CandidateNavLink
            to="/profile-resume"
            label="My Profile & Resume"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <CandidateNavLink
            to="/interviews-offers"
            label="Interviews & Offers"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <button
            type="button"
            onClick={onSettingsClick}
            aria-pressed={isSettingsOpen}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
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

      {/* Footer / Switch / User */}
      <div className="space-y-3 pt-3">
        {/* Switch Portal Links */}
        <div className="space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
          <Link
            to="/recruiter"
            className="flex items-center justify-center gap-2 w-full px-2.5 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Recruiter Console</span>
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-2.5 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition"
          >
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Admin Console</span>
          </Link>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            HL
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-slate-800 truncate">
              Harriet Lawrence
            </div>
            <div className="text-slate-400 text-[10px] truncate">
              Candidate Applicant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type CandidateNavLinkProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

function CandidateNavLink({ to, label, icon }: CandidateNavLinkProps) {
  return (
    <NavLink
      to={to}
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
