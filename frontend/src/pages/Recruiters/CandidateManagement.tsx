import { useMemo, useState } from "react";

type Candidate = {
  initials: string;
  name: string;
  role: string;
  match: string;
  matchValue: number;
  skills: string[];
  stage: string;
  stageTone: "orange" | "green" | "blue";
  review: string;
  reviewTone: "muted" | "green" | "amber";
  action: string;
};

const summaryCards = [
  { label: "TOTAL APPLICANTS", value: "184", detail: "+24 this week", detailClass: "text-blue-600" },
  { label: "AI-SCREENED", value: "142", detail: "high confidence", detailClass: "text-green-600" },
  { label: "IN INTERVIEW", value: "28", detail: "active rounds", detailClass: "text-amber-600" },
  { label: "OFFERS EXTENDED", value: "6", detail: "in final stage", detailClass: "text-green-600" },
];

const tabs = [
  { label: "All", count: 184 },
  { label: "High Match >85%", count: 62 },
  { label: "Interviewing", count: 28 },
  { label: "Needs Review", count: 9 },
  { label: "Archived", count: 85 },
];

const candidates: Candidate[] = [
  {
    initials: "HL",
    name: "Harriet Lawrence",
    role: "Lead UX Researcher",
    match: "92% Match",
    matchValue: 92,
    skills: ["Figma", "User Testing"],
    stage: "Interviewing",
    stageTone: "orange",
    review: "Draft: Ready",
    reviewTone: "muted",
    action: "Approve & Send",
  },
  {
    initials: "MB",
    name: "Marcus Broadus",
    role: "Senior Backend Dev",
    match: "86% Match",
    matchValue: 86,
    skills: ["Java", "Spring Boot"],
    stage: "Offer Stage",
    stageTone: "green",
    review: "Approved",
    reviewTone: "green",
    action: "View Dossier",
  },
  {
    initials: "SK",
    name: "Sonia Khavis",
    role: "Product Marketing Lead",
    match: "78% Match",
    matchValue: 78,
    skills: ["GTM", "Analytics"],
    stage: "Screened",
    stageTone: "blue",
    review: "Needs Review",
    reviewTone: "amber",
    action: "Evaluate",
  },
];

const stageStyles = {
  orange: { container: "bg-orange-50 border-orange-200", dot: "bg-amber-600", text: "text-amber-600" },
  green: { container: "bg-emerald-50 border-emerald-200", dot: "bg-green-600", text: "text-green-600" },
  blue: { container: "bg-blue-50 border-blue-100", dot: "bg-blue-600", text: "text-blue-700" },
};

// Component Sidebar điều hướng Quản lý
export const ManagerSidebarSection = () => {
  const [activeItem, setActiveItem] = useState("Candidates");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Overview" },
    { label: "Jobs" },
    { label: "Candidates", active: true },
    { label: "Evaluations & Feedback" },
    { label: "Interview Calendar" },
    { label: "Hiring Analytics" },
    { label: "Notifications & Audit Log" },
  ];

  return (
    <aside className="flex flex-col w-60 items-start gap-7 pt-6 pb-5 px-4 bg-white overflow-hidden border-r border-slate-200 min-h-screen justify-between">
      <div className="w-full">
        <div className="flex items-center gap-2.5 px-2 py-0 mb-6">
          <div className="flex w-8 h-8 items-center justify-center bg-blue-600 rounded-lg text-white font-bold text-sm">S</div>
          <span className="font-semibold text-slate-900 text-lg">SmartRecruit</span>
        </div>
        <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 tracking-wider">MANAGER WORKSPACE</div>
        <nav aria-label="Manager workspace" className="flex flex-col gap-1 w-full">
          {navigationItems.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveItem(item.label)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition w-full ${
                  isActive ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex-1">{item.label}</span>
                {isActive && item.label === "Candidates" && <div className="w-1 h-5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="items-center gap-3 pt-4 pb-0 px-2 w-full border-t border-slate-200 flex relative">
        <div className="flex flex-col w-9 h-9 items-center justify-center bg-blue-50 rounded-full border border-blue-100 text-blue-700 font-bold text-xs">
          AJ
        </div>
        <div className="flex flex-col items-start gap-0.5 flex-1">
          <div className="font-semibold text-slate-900 text-sm">Alex Johnson</div>
          <div className="text-slate-500 text-xs">Hiring Manager</div>
        </div>
        <button
          type="button"
          aria-label="Open account menu"
          onClick={() => setProfileMenuOpen((open) => !open)}
          className="text-slate-500 text-base"
        >
          •••
        </button>
        {profileMenuOpen && (
          <div role="menu" className="absolute bottom-16 right-0 z-10 w-36 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
            <button role="menuitem" className="w-full rounded px-2 py-1 text-left text-xs text-slate-600 hover:bg-slate-50" onClick={() => setProfileMenuOpen(false)}>
              Account settings
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

// Component nội dung Pipeline ứng viên
export const CandidatePipelineSection = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [requisition, setRequisition] = useState("All Roles");
  const [sort, setSort] = useState("Match Score (High to Low)");
  const [notice, setNotice] = useState("");

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(query));

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "High Match >85%" && candidate.matchValue > 85) ||
        (activeTab === "Interviewing" && candidate.stage === "Interviewing") ||
        (activeTab === "Needs Review" && candidate.review === "Needs Review") ||
        activeTab === "Archived";

      return matchesSearch && matchesTab;
    });

    if (sort === "Match Score (Low to High)") {
      return [...filtered].sort((a, b) => a.matchValue - b.matchValue);
    }
    return [...filtered].sort((a, b) => b.matchValue - a.matchValue);
  }, [activeTab, search, sort]);

  const handleAction = (candidate: Candidate) => {
    setNotice(`${candidate.action} selected for ${candidate.name}`);
    setTimeout(() => setNotice(""), 2500);
  };

  return (
    <main className="flex-col items-start flex-1 grow bg-slate-50 flex relative min-w-0">
      <header className="flex h-16 items-center justify-between px-7 py-0 w-full bg-white border-b border-slate-200">
        <p className="text-xs text-slate-500">
          Workspace / Manager / <span className="font-semibold text-slate-900">Candidates</span>
        </p>
        <div className="flex items-center gap-3">
          <label className="flex w-[310px] h-9 items-center gap-2 px-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 text-xs">🔍</span>
            <input
              aria-label="Search candidates"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by candidate name, skill..."
              className="flex-1 bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400"
            />
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">⌘ K</kbd>
          </label>
          <div className="flex h-[30px] items-center gap-1.5 px-2.5 bg-white rounded-full border border-slate-200">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            <span className="font-bold text-green-600 text-[10px]">Live Sync</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-start gap-6 p-7 w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-slate-900 text-2xl font-bold">Candidates &amp; Talent Pipeline</h1>
            <p className="text-slate-500 text-sm">Review applicant dossiers, deterministic AI match scores, and manage hiring stages</p>
          </div>
          <button
            type="button"
            onClick={() => setNotice("Add Candidate form opened")}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold"
          >
            <span>+</span> Add Candidate
          </button>
        </div>

        {/* Summary Cards */}
        <section aria-label="Candidate summary" className="grid grid-cols-4 gap-4 w-full">
          {summaryCards.map((card) => (
            <article key={card.label} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between h-28 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-slate-500 text-[10px] font-bold tracking-wide">{card.label}</h2>
                <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 text-xs">📊</div>
              </div>
              <div className="flex items-baseline gap-2">
                <strong className="text-slate-900 text-3xl font-bold">{card.value}</strong>
                <span className={`text-[10px] font-semibold ${card.detailClass}`}>{card.detail}</span>
              </div>
            </article>
          ))}
        </section>

        {/* Tabs & Filters */}
        <div className="flex items-center justify-between w-full">
          <nav aria-label="Candidate filters" className="flex bg-white p-1 rounded-lg border border-slate-200">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.label)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                    isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="flex gap-2">
            <select
              aria-label="Filter by requisition"
              value={requisition}
              onChange={(event) => setRequisition(event.target.value)}
              className="h-9 px-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 outline-none"
            >
              <option>All Roles</option>
              <option>Design</option>
              <option>Engineering</option>
              <option>Marketing</option>
            </select>
            <select
              aria-label="Sort candidates"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-9 px-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 outline-none"
            >
              <option>Match Score (High to Low)</option>
              <option>Match Score (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Candidates Table */}
        <section className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex h-12 items-center justify-between px-5 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 text-sm font-bold">Master Candidates</h2>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">184 records</span>
            </div>
          </div>
          <div className="grid grid-cols-[240px_110px_1fr_130px_120px_140px] items-center px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
            <div>CANDIDATE</div>
            <div>AI MATCH</div>
            <div>SKILLS</div>
            <div>STAGE</div>
            <div>REVIEW</div>
            <div className="text-right">ACTION</div>
          </div>
          {filteredCandidates.map((candidate) => {
            const stage = stageStyles[candidate.stageTone];
            return (
              <div key={candidate.name} className="grid grid-cols-[240px_110px_1fr_130px_120px_140px] items-center px-5 py-4 bg-white border-b border-slate-100 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-blue-50 rounded-full border border-blue-100 text-blue-700 font-bold text-xs">
                    {candidate.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{candidate.name}</div>
                    <div className="text-[10px] text-slate-500">{candidate.role}</div>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${candidate.matchValue >= 85 ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-orange-50 text-amber-600 border border-orange-200"}`}>
                    {candidate.match}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-600">
                      {skill}
                    </span>
                  ))}
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${stage.container} ${stage.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                    {candidate.stage}
                  </span>
                </div>
                <div className={`text-xs font-semibold ${candidate.reviewTone === "green" ? "text-green-600" : candidate.reviewTone === "amber" ? "text-amber-600" : "text-slate-500"}`}>
                  {candidate.review}
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => handleAction(candidate)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      candidate.name === "Harriet Lawrence" ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {candidate.action} ›
                  </button>
                </div>
              </div>
            );
          })}

          <footer className="flex h-12 items-center justify-between px-5 bg-white">
            <p className="text-[10px] text-slate-500">Showing {filteredCandidates.length} of 184 candidates</p>
            <div className="flex gap-1.5">
              <button type="button" className="w-6 h-6 rounded bg-blue-600 text-white font-bold text-[10px]">1</button>
              <button type="button" className="w-6 h-6 rounded border border-slate-200 text-slate-600 text-[10px]">2</button>
            </div>
          </footer>
        </section>
      </div>

      {notice && (
        <div role="status" className="fixed bottom-5 right-5 rounded-lg bg-slate-900 px-4 py-3 text-xs text-white shadow-lg">
          {notice}
        </div>
      )}
    </main>
  );
};

// Component chính export ra ngoài
export const Candidates = () => {
  return <CandidatePipelineSection />;
};

export default Candidates;