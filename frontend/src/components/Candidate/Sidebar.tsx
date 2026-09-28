export const Sidebar = () => {
  return (
    <div className="flex flex-col w-60 items-start justify-between pt-8 pb-6 px-4 relative self-stretch bg-white border-r [border-right-style:solid] border-slate-200">
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
        <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center gap-3 px-4 py-3 relative self-stretch w-full flex-[0_0_auto] bg-blue-50 rounded-lg">
            <div className="absolute h-full top-0 left-0 w-[3px] bg-blue-600" />
            <img
              className="relative w-[18px] h-[18px]"
              alt="Icon container"
              src="https://c.animaapp.com/0Wq6mfKp/img/icon-container.svg"
            />
            <div className="relative w-fit mt-[-0.50px] [font-family:'Inter',Helvetica] font-semibold text-blue-600 text-sm tracking-[0] leading-[normal]">
              My Applications
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 relative self-stretch w-full flex-[0_0_auto] rounded-lg">
            <img
              className="relative w-[18px] h-[18px]"
              alt="Icon container"
              src="https://c.animaapp.com/0Wq6mfKp/img/icon-container-1.svg"
            />
            <div className="relative w-fit mt-[-0.50px] [font-family:'Inter',Helvetica] font-medium text-slate-500 text-sm tracking-[0] leading-[normal]">
              Explore Jobs
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 relative self-stretch w-full flex-[0_0_auto] rounded-lg">
            <img
              className="relative w-[18px] h-[18px]"
              alt="Icon container"
              src="https://c.animaapp.com/0Wq6mfKp/img/icon-container-2.svg"
            />
            <div className="relative w-fit mt-[-0.50px] [font-family:'Inter',Helvetica] font-medium text-slate-500 text-sm tracking-[0] leading-[normal]">
              My Profile &amp; Resume
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 relative self-stretch w-full flex-[0_0_auto] rounded-lg">
            <img
              className="relative w-[18px] h-[18px]"
              alt="Icon container"
              src="https://c.animaapp.com/0Wq6mfKp/img/icon-container-3.svg"
            />
            <div className="relative w-fit mt-[-0.50px] [font-family:'Inter',Helvetica] font-medium text-slate-500 text-sm tracking-[0] leading-[normal]">
              Interviews &amp; Offers
            </div>
          </div>
        </div>
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
