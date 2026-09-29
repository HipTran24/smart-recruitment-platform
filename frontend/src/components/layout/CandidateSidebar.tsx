import { NavLink } from "react-router-dom";

export const CandidateSidebar = () => {
  return (
    <div className="flex w-60 shrink-0 flex-col items-start justify-between self-stretch bg-white px-4 pb-6 pt-8 border-r border-slate-200">
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
