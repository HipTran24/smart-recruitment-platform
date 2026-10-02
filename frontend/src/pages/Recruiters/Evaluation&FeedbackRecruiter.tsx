import { useMemo, useState } from "react";

type EvaluationStatus = "Ready" | "Approved" | "Overdue";

type Evaluation = {
  initials: string;
  name: string;
  role: string;
  avatarClass: string;
  score: string;
  recommendation?: string;
  excerpt: string;
  status: EvaluationStatus;
  action: string;
};

const evaluations: Evaluation[] = [
  {
    initials: "HL",
    name: "Harriet Lawrence",
    role: "Lead UX Researcher",
    avatarClass: "bg-violet-500",
    score: "4.8/5.0",
    recommendation: "Strong Hire",
    excerpt:
      "Commended for Figma mastery, collaborative facilitation skill, and system thinking design methodology demonstrated during panel session...",
    status: "Ready",
    action: "Approve & Send",
  },
  {
    initials: "MB",
    name: "Marcus Broadus",
    role: "Senior Backend Dev",
    avatarClass: "bg-blue-500",
    score: "4.5/5.0",
    recommendation: "Hire",
    excerpt:
      "Strong Spring Boot fit, highly descriptive design rationale pattern, although further clean code verification recommended during followups...",
    status: "Approved",
    action: "Send Email",
  },
  {
    initials: "SK",
    name: "Sonia Khavis",
    role: "Product Marketing Lead",
    avatarClass: "bg-amber-500",
    score: "Pending Score",
    excerpt:
      "Awaiting rubric submission from panel members. Candidate evaluation cannot be draft compiled until scores satisfy threshold...",
    status: "Overdue",
    action: "Complete Rubric",
  },
];

const tabs = [
  { label: "All", count: 109 },
  { label: "Pending Rubric", count: 9 },
  { label: "Ready to Approve", count: 14 },
  { label: "Dispatched", count: 86 },
];

const statusStyles: Record<
  EvaluationStatus,
  { wrapper: string; dot: string; text: string }
> = {
  Ready: {
    wrapper: "bg-blue-50 border-blue-300",
    dot: "bg-blue-600",
    text: "text-blue-700",
  },
  Approved: {
    wrapper: "bg-emerald-50 border-emerald-200",
    dot: "bg-green-600",
    text: "text-green-600",
  },
  Overdue: {
    wrapper: "bg-amber-50 border-amber-300",
    dot: "bg-amber-600",
    text: "text-amber-600",
  },
};

// Component thanh điều hướng bên trái (Sidebar)
export const RecruitmentNavigationSection = () => {
  const [activeItem, setActiveItem] = useState("Evaluations & Feedback");

  const navigationItems = [
    { label: "Overview" },
    { label: "Jobs" },
    { label: "Candidates" },
    { label: "Evaluations & Feedback" },
    { label: "Interview Calendar" },
    { label: "Hiring Analytics" },
    { label: "Notifications & Audit Log" },
  ];

  return (
    <aside
      className="flex flex-col w-60 items-start justify-between bg-white border-r border-slate-200 min-h-screen p-4 shrink-0"
      aria-label="Recruitment navigation"
    >
      <div className="flex flex-col w-full gap-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex w-8 h-8 items-center justify-center bg-blue-600 rounded-lg text-white font-bold text-sm">
            S
          </div>
          <span className="font-bold text-slate-900 text-lg">SmartRecruit</span>
        </div>

        <div className="px-2 text-[10px] font-bold text-slate-400 tracking-wider">
          MANAGER WORKSPACE
        </div>

        <nav aria-label="Main navigation" className="flex flex-col gap-1 w-full">
          {navigationItems.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveItem(item.label)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 p-2 w-full border-t border-slate-200 pt-4">
        <div className="flex flex-col w-9 h-9 items-center justify-center bg-blue-50 rounded-full border border-blue-200 text-blue-700 font-bold text-xs">
          AJ
        </div>
        <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate w-full">
            Alex Johnson
          </div>
          <div className="text-[11px] text-slate-500 truncate w-full">
            Hiring Manager
          </div>
        </div>
      </div>
    </aside>
  );
};

// Component nội dung chính duyệt đánh giá và phản hồi
export const EvaluationFeedbackApprovalSection = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [requisition, setRequisition] = useState("All Roles");
  const [decision, setDecision] = useState("All Outcomes");
  const [sort, setSort] = useState("Newest");
  const [sentCandidates, setSentCandidates] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const filteredEvaluations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return evaluations.filter((evaluation) => {
      const matchesSearch =
        !normalizedSearch ||
        evaluation.name.toLowerCase().includes(normalizedSearch) ||
        evaluation.role.toLowerCase().includes(normalizedSearch) ||
        evaluation.excerpt.toLowerCase().includes(normalizedSearch);

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Pending Rubric" && evaluation.status === "Overdue") ||
        (activeTab === "Ready to Approve" && evaluation.status === "Ready") ||
        (activeTab === "Dispatched" && evaluation.status === "Approved");

      return matchesSearch && matchesTab;
    });
  }, [activeTab, search]);

  const handleAction = (evaluation: Evaluation) => {
    setSentCandidates((current) =>
      current.includes(evaluation.name)
        ? current
        : [...current, evaluation.name],
    );
    setNotice(`${evaluation.action} completed for ${evaluation.name}`);
    setTimeout(() => setNotice(""), 2500);
  };

  return (
    <main className="flex flex-col items-start flex-1 grow bg-slate-50 min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 w-full bg-white border-b border-slate-200">
        <nav aria-label="Breadcrumb">
          <p className="text-xs text-slate-500">
            Workspace / Manager /{" "}
            <span className="font-semibold text-slate-900">
              Evaluations &amp; Feedback
            </span>
          </p>
        </nav>
        <div className="flex items-center gap-3">
          <label className="flex w-60 items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 text-xs">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search feedback..."
              aria-label="Search feedback"
              className="flex-1 bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400"
            />
          </label>
          <div
            role="status"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200"
          >
            <span className="bg-green-600 w-1.5 h-1.5 rounded-full" />
            <span className="font-bold text-green-600 text-[10px] whitespace-nowrap">
              Live Sync
            </span>
          </div>
        </div>
      </header>

      <section className="flex flex-col items-start gap-6 p-8 w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="font-bold text-slate-900 text-2xl">
              Evaluations &amp; Feedback Approval Studio
            </h1>
            <p className="text-slate-500 text-sm">
              Review rubric scores, curate AI feedback drafts, and approve
              candidate email dispatches
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold"
            onClick={() => window.alert("New evaluation started")}
          >
            <span>+</span> New Evaluation
          </button>
        </div>

        {/* Thẻ chỉ số tổng quan */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {[
            ["PENDING EVALUATIONS", "9", "bg-amber-600", "overdue rubrics"],
            ["DRAFTS READY TO APPROVE", "14", "bg-blue-600", "AI-generated"],
            ["DISPATCHED EMAILS", "86", "bg-green-600", "sent successfully"],
            ["AVG REVIEW TIME", "1.8 days", "bg-green-600", "-0.4d turnaround"],
          ].map(([label, value, dotColor, detail]) => (
            <article
              key={label}
              className="flex flex-col items-start justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm h-28"
            >
              <div className="font-bold text-[10px] text-slate-500 tracking-wider">
                {label}
              </div>
              <div className="font-bold text-slate-900 text-3xl">{value}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <span>{detail}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Thanh lọc & Tabs */}
        <div className="flex items-center justify-between w-full">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            {tabs.map((tab) => {
              const selected = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveTab(tab.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                    selected
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      selected
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={requisition}
              onChange={(e) => setRequisition(e.target.value)}
              className="h-9 px-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 outline-none"
            >
              {["All Roles", "Engineering", "Design", "Marketing"].map(
                (opt) => (
                  <option key={opt} value={opt}>
                    Requisition: {opt}
                  </option>
                ),
              )}
            </select>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="h-9 px-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 outline-none"
            >
              {["All Outcomes", "Hire", "Strong Hire", "No Hire"].map((opt) => (
                <option key={opt} value={opt}>
                  Decision: {opt}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 px-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 outline-none"
            >
              {["Newest", "Oldest", "Highest Score"].map((opt) => (
                <option key={opt} value={opt}>
                  Sort: {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng danh sách Evaluations */}
        <section className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-[240px_140px_1fr_120px_140px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500">
            <div>CANDIDATE</div>
            <div>RUBRIC SCORE</div>
            <div>AI DRAFT EXCERPT</div>
            <div>STATUS</div>
            <div className="text-right">ACTION</div>
          </div>

          {filteredEvaluations.map((evaluation) => {
            const status = statusStyles[evaluation.status];
            const isSent = sentCandidates.includes(evaluation.name);
            return (
              <div
                key={evaluation.name}
                className="grid grid-cols-[240px_140px_1fr_120px_140px] items-center gap-4 px-6 py-4 bg-white border-b border-slate-100 last:border-b-0 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${evaluation.avatarClass} flex w-9 h-9 items-center justify-center rounded-full text-white font-semibold text-xs`}
                  >
                    {evaluation.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-900 text-xs truncate">
                      {evaluation.name}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {evaluation.role}
                    </span>
                  </div>
                </div>

                <div>
                  {evaluation.recommendation ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">
                        {evaluation.score}
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-green-600 rounded text-[10px] font-semibold">
                        {evaluation.recommendation}
                      </span>
                    </div>
                  ) : (
                    <span className="italic text-slate-400 text-xs">
                      {evaluation.score}
                    </span>
                  )}
                </div>

                <div className="min-w-0 pr-4">
                  <p
                    className={`text-xs line-clamp-2 ${
                      evaluation.status === "Overdue"
                        ? "text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    {evaluation.excerpt}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${status.wrapper} ${status.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    <span>{isSent ? "Sent" : evaluation.status}</span>
                  </span>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => handleAction(evaluation)}
                    disabled={isSent}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      isSent
                        ? "bg-emerald-50 border-emerald-200 text-green-600"
                        : evaluation.status === "Ready"
                          ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                          : evaluation.status === "Overdue"
                            ? "bg-white border-amber-300 text-amber-600 hover:bg-amber-50"
                            : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {isSent ? "Sent" : evaluation.action}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredEvaluations.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No evaluations match your search or selected filters.
            </div>
          )}
        </section>
      </section>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 rounded-lg bg-slate-900 px-4 py-3 text-xs text-white shadow-lg"
        >
          {notice}
        </div>
      )}
    </main>
  );
};

// Component chính export mặc định để liên kết vào routing
export default function EvaluationFeedbackRecruiter() {
  return <EvaluationFeedbackApprovalSection />;
}