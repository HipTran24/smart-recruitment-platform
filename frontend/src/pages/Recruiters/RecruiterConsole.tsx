import { useMemo, useState } from "react";

type Stat = {
  label: string;
  value: string;
  detail: string;
  detailClass: string;
};

type FunnelStage = {
  label: string;
  count: string;
  percentage: string;
  width: string;
};

type ActionItem = {
  title: string;
  description: string;
  accentClass: string;
};

type Candidate = {
  initials: string;
  name: string;
  role: string;
  match: string;
  matchClass: string;
  stage: string;
  feedback: string;
  feedbackColor: string;
  action: string;
  actionClass: string;
};

const stats: Stat[] = [
  { label: "OPEN REQUISITIONS", value: "12", detail: "+2 this week", detailClass: "text-green-600" },
  { label: "TOTAL APPLICANTS", value: "184", detail: "142 AI-Screened", detailClass: "text-blue-600" },
  { label: "PENDING APPROVALS", value: "9", detail: "Feedback drafts & rubrics", detailClass: "text-amber-600" },
  { label: "AVG TIME TO HIRE", value: "14.2 days", detail: "-1.6d vs target", detailClass: "text-green-600" },
];

const funnelStages: FunnelStage[] = [
  { label: "Applied", count: "124", percentage: "100%", width: "w-80" },
  { label: "AI-Screened", count: "62", percentage: "50%", width: "w-40" },
  { label: "Interview", count: "28", percentage: "23%", width: "w-[74px]" },
  { label: "Offer Extended", count: "6", percentage: "5%", width: "w-4" },
];

const actionItems: ActionItem[] = [
  { title: "Approve AI Feedback Drafts (3 pending)", description: "Review auto-generated technical evaluation summaries", accentClass: "border-blue-600" },
  { title: "CV Extraction Review (2 files)", description: "Verify parsed candidate profiles with manual match checks", accentClass: "border-amber-500" },
  { title: "Interview Rubric Overdue", description: "Provide structured evaluation standards for active positions", accentClass: "border-amber-500" },
];

const candidates: Candidate[] = [
  {
    initials: "HL",
    name: "Harriet Lawrence",
    role: "Lead UX Researcher",
    match: "92% Match",
    matchClass: "bg-blue-50 border-blue-200 text-blue-700",
    stage: "Interviewing",
    feedback: "Draft: Ready",
    feedbackColor: "bg-blue-600",
    action: "Approve & Send",
    actionClass: "bg-blue-600 text-white border-blue-600",
  },
  {
    initials: "MB",
    name: "Marcus Broadus",
    role: "Senior Backend Dev",
    match: "86% Match",
    matchClass: "bg-blue-50 border-blue-200 text-blue-700",
    stage: "Offer Stage",
    feedback: "Approved",
    feedbackColor: "bg-green-600",
    action: "View Dossier",
    actionClass: "bg-white text-slate-900 border-slate-200",
  },
  {
    initials: "SK",
    name: "Sonia Khavis",
    role: "Product Marketing Lead",
    match: "78% Match",
    matchClass: "bg-orange-50 border-orange-200 text-amber-600",
    stage: "Screened",
    feedback: "Needs Review",
    feedbackColor: "bg-amber-600",
    action: "Evaluate",
    actionClass: "bg-white text-slate-900 border-slate-200",
  },
];

// Component Sidebar điều hướng Recruiter
export const RecruitmentNavigationSection = () => {
  const [activeItem, setActiveItem] = useState("Overview");
  const navItems = ["Overview", "Jobs", "Candidates", "Evaluations & Feedback", "Interview Calendar", "Hiring Analytics", "Notifications & Audit Log"];

  return (
    <aside className="relative self-stretch w-60 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-screen">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex w-7 h-7 items-center justify-center bg-blue-50 rounded-md text-blue-700 font-bold text-xs">S</div>
          <span className="font-bold text-slate-900 text-lg">SmartRecruit</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeItem === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveItem(item)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{item}</span>
                {isActive && <div className="w-1 h-5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-200 pt-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">AJ</div>
        <div>
          <div className="font-semibold text-slate-900 text-sm">Alex Johnson</div>
          <div className="text-slate-500 text-xs">Hiring Manager</div>
        </div>
      </div>
    </aside>
  );
};

// Component nội dung chính Dashboard
export const HiringOperationsDashboardSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resolvedActions, setResolvedActions] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const filteredCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter((c) => [c.name, c.role, c.stage, c.feedback].join(" ").toLowerCase().includes(query));
  }, [searchTerm]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const handleResolve = (title: string) => {
    setResolvedActions((curr) => (curr.includes(title) ? curr : [...curr, title]));
    showNotice(`${title} resolved`);
  };

  return (
    <main className="relative flex flex-1 grow flex-col items-start bg-slate-50 min-h-screen">
      <header className="flex w-full items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <p className="text-sm font-medium text-slate-500">Workspace / <span className="text-slate-900">Manager</span></p>
        <div className="flex items-center gap-4">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">• Live Sync</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applicants..."
            className="w-60 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>
      <div className="flex w-full flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hiring Operations Dashboard</h1>
            <p className="text-sm text-slate-500">Manage requisitions, AI candidate matching, and feedback approvals</p>
          </div>
          <button onClick={() => showNotice("New job posting started")} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-4 gap-4 w-full">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
              <h2 className="text-[11px] font-bold text-slate-500">{stat.label}</h2>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className={`text-xs font-medium ${stat.detailClass}`}>{stat.detail}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Funnel & Action Center */}
        <div className="grid grid-cols-3 gap-5 w-full">
          <section className="col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Hiring Funnel</h2>
            <div className="flex flex-col gap-3">
              {funnelStages.map((stage) => (
                <div key={stage.label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span>{stage.label}</span>
                    <span className="text-blue-600">{stage.count} <span className="text-slate-400 text-xs font-medium">({stage.percentage})</span></span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
                    <div className={`h-full rounded bg-blue-600 ${stage.width}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Manager Action Center</h2>
            <div className="flex flex-col gap-2.5">
              {actionItems.map((item) => {
                const isResolved = resolvedActions.includes(item.title);
                return (
                  <article key={item.title} className={`flex items-center justify-between rounded-lg border border-slate-200 border-l-4 p-3 bg-white ${item.accentClass} ${isResolved ? "opacity-50" : ""}`}>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </div>
                    <button disabled={isResolved} onClick={() => handleResolve(item.title)} className="rounded bg-blue-50 border border-blue-200 px-2 py-1 text-[11px] font-semibold text-blue-700">
                      {isResolved ? "Resolved" : "Resolve"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Candidates Table */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Candidate Pipeline & AI Match Matrix</h2>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Active Requisitions Only</span>
          </div>
          <div className="grid grid-cols-6 text-[11px] font-bold text-slate-500 pb-2 border-b border-slate-200 bg-slate-50 px-3 py-2 rounded-lg">
            <div>CANDIDATE</div>
            <div>APPLIED ROLE</div>
            <div>AI MATCH</div>
            <div>PIPELINE STAGE</div>
            <div>FEEDBACK/APPROVAL</div>
            <div className="text-right">ACTION</div>
          </div>
          {filteredCandidates.map((c) => (
            <div key={c.name} className="grid grid-cols-6 items-center px-3 py-3.5 border-b border-slate-100 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{c.initials}</div>
                <span className="font-semibold text-slate-900">{c.name}</span>
              </div>
              <div className="text-slate-500 text-xs">{c.role}</div>
              <div><span className={`rounded-md border px-2 py-1 text-xs font-bold ${c.matchClass}`}>{c.match}</span></div>
              <div className="font-medium text-slate-800 text-xs">{c.stage}</div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${c.feedbackColor}`} />
                <span>{c.feedback}</span>
              </div>
              <div className="text-right">
                <button onClick={() => showNotice(`Action selected for ${c.name}`)} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${c.actionClass}`}>
                  {c.action}
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
      {notice && <div className="fixed bottom-5 right-5 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{notice}</div>}
    </main>
  );
};

// Component chính export ra ngoài
export default function RecruiterConsole() {
  return <HiringOperationsDashboardSection />;
}