import { NavLink } from "react-router-dom";

type CandidateSidebarProps = {
  isSettingsOpen: boolean;
  onSettingsClick: () => void;
};

export const CandidateSidebar = ({
  isSettingsOpen,
  onSettingsClick,
}: CandidateSidebarProps) => {
  return (
    <div className="relative flex w-60 shrink-0 flex-col items-start justify-between self-stretch border-r border-slate-200 bg-white px-4 pb-6 pt-8">
      <div className="flex flex-col items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center gap-2.5 pl-2 pr-0 py-0 relative self-stretch w-full flex-[0_0_auto]">
          <img
            className="relative w-8 h-8"
            alt="Brand mark"
            src="https://c.animaapp.com/0Wq6mfKp/img/brandmark.svg"
          />
          <div className="relative w-fit [font-family:'Inter',Helvetica] font-bold text-slate-900 text-lg tracking-[0] leading-[normal]">
            SmartRecruit
          </div>
        </div>
        <nav className="flex w-full flex-col items-start gap-1">
          <CandidateNavLink
            to="/my-applications"
            label="My Applications"
            icon="https://c.animaapp.com/0Wq6mfKp/img/icon-container.svg"
          />
          <CandidateNavLink
            to="/explore-jobs"
            label="Explore Jobs"
            icon="https://c.animaapp.com/0Wq6mfKp/img/icon-container-1.svg"
          />
          <CandidateNavLink
            to="/profile-resume"
            label="My Profile & Resume"
            icon="https://c.animaapp.com/0Wq6mfKp/img/icon-container-2.svg"
          />
          <CandidateNavLink
            to="/interviews-offers"
            label="Interviews & Offers"
            icon="https://c.animaapp.com/0Wq6mfKp/img/icon-container-3.svg"
          />
        </nav>
      </div>
      <div className="flex items-center gap-3 pt-4 pb-0 px-2 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-slate-200">
        <img
          className="relative w-10 h-10 object-cover"
          alt="Avatar"
          src="https://c.animaapp.com/0Wq6mfKp/img/avatar@2x.png"
        />
        <div className="flex flex-col items-start gap-0.5 relative flex-1 grow">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-slate-900 text-sm tracking-[0] leading-[normal] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
            Harriet Lawrence
          </div>
          <div className="w-fit font-normal text-xs relative [font-family:'Inter',Helvetica] text-slate-500 tracking-[0] leading-[normal]">
            Candidate
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSettingsClick}
        aria-pressed={isSettingsOpen}
        className={`absolute bottom-0 left-4 flex h-6 w-[calc(100%-2rem)] items-center gap-3 rounded-lg px-4 text-sm transition-colors ${
          isSettingsOpen
            ? "bg-blue-50 font-semibold text-blue-600"
            : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px] shrink-0"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a7.8 7.8 0 0 1-1.4.8l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.4-.8l-1.7.7-1.4-2.4 1.4-1.1a7.1 7.1 0 0 1 0-1.7l-1.4-1.1 1.4-2.4 1.7.7a7.8 7.8 0 0 1 1.4-.8l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.4.8l1.7-.7 1.4 2.4-1.4 1.1a7.1 7.1 0 0 1 0 1.7Z" />
        </svg>
        <span>Settings</span>
      </button>
    </div>
  );
};

type CandidateNavLinkProps = {
  to: string;
  label: string;
  icon: string;
};

function CandidateNavLink({ to, label, icon }: CandidateNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm ${
          isActive
            ? "bg-blue-50 font-semibold text-blue-600"
            : "font-medium text-slate-500 hover:bg-slate-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-600" />
          )}
          <img className="h-[18px] w-[18px]" alt="" src={icon} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
