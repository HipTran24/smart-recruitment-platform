import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { StatusBadge, aiMatchBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";

type FunnelStage = {
  label: string;
  count: number;
  percentage: string;
  barWidth: string;
};

type ActionItem = {
  id: string;
  title: string;
  reason: string;
  urgency: "high" | "medium";
  count: number;
  actionText: string;
  link: string;
};

type PriorityCandidate = {
  id: string;
  initials: string;
  name: string;
  role: string;
  matchScore: number;
  stage: string;
  reviewStatus: "Ready" | "Approved" | "Needs Review";
  action: string;
  link: string;
};

const funnelStages: FunnelStage[] = [
  { label: "Applied Candidates", count: 184, percentage: "100%", barWidth: "w-full" },
  { label: "AI Screened (>70%)", count: 142, percentage: "77.1%", barWidth: "w-[77%]" },
  { label: "Technical Interview", count: 28, percentage: "15.2%", barWidth: "w-[15%]" },
  { label: "Offer Extended", count: 6, percentage: "3.2%", barWidth: "w-[8%]" },
];

const initialActionItems: ActionItem[] = [
  {
    id: "act-1",
    title: "Approve AI Feedback Drafts",
    reason: "3 drafts awaiting human review before transmission to candidates",
    urgency: "high",
    count: 3,
    actionText: "Review Drafts",
    link: "/recruiter/evaluations/ai-feedback",
  },
  {
    id: "act-2",
    title: "CV Extraction Verification",
    reason: "2 PDF resumes need human check on rare domain taxonomy",
    urgency: "medium",
    count: 2,
    actionText: "Verify Profiles",
    link: "/recruiter/candidates/screening",
  },
  {
    id: "act-3",
    title: "Panel Interview Schedule Confirmation",
    reason: "2 candidates requested morning slot confirmations for Thursday",
    urgency: "medium",
    count: 2,
    actionText: "Open Calendar",
    link: "/recruiter/calendar",
  },
];

const priorityCandidates: PriorityCandidate[] = [
  {
    id: "cand-1",
    initials: "HL",
    name: "Harriet Lawrence",
    role: "Lead UX Researcher",
    matchScore: 92,
    stage: "Interviewing",
    reviewStatus: "Ready",
    action: "Approve & Send",
    link: "/recruiter/candidates/detail",
  },
  {
    id: "cand-2",
    initials: "MB",
    name: "Marcus Broadus",
    role: "Senior Backend Dev",
    matchScore: 88,
    stage: "Offer Stage",
    reviewStatus: "Approved",
    action: "View Dossier",
    link: "/recruiter/candidates/detail",
  },
  {
    id: "cand-3",
    initials: "SK",
    name: "Sonia Khavis",
    role: "Product Marketing Lead",
    matchScore: 81,
    stage: "Screened",
    reviewStatus: "Needs Review",
    action: "Evaluate",
    link: "/recruiter/candidates/detail",
  },
  {
    id: "cand-4",
    initials: "EN",
    name: "Elena Novak",
    role: "Lead Data Scientist",
    matchScore: 91,
    stage: "Interviewing",
    reviewStatus: "Ready",
    action: "View Dossier",
    link: "/recruiter/candidates/detail",
  },
];

export default function RecruiterConsole() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionItems, setActionItems] = useState(initialActionItems);
  const [notice, setNotice] = useState("");

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  };

  const handleResolveAction = (id: string, title: string) => {
    setActionItems((items) => items.filter((item) => item.id !== id));
    showNotice(`Resolved: ${title}`);
  };

  const filteredCandidates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return priorityCandidates;
    return priorityCandidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Workspace", href: "/recruiter/console" },
          { label: "Recruiter Console", href: "/recruiter/console" },
        ]}
        title="Hiring Operations Dashboard"
        description="Monitor active requisitions, evaluate deterministic Gemini 2.5 applicant scores, and approve feedback drafts."
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/recruiter/jobs/create">
              <Button
                variant="primary"
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Post New Job
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Open Requisitions
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">12</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+2 this week</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Across 4 engineering and design squads</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Applicants
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">184</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">142 Screened</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">77.1% qualify above minimum threshold</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Pending Human Approvals
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{actionItems.length}</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Requires Recruiter</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Feedback drafts and rubric calibrations</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Avg Time to Hire
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">14.2d</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-1.6d vs Target</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Sprint 8 velocity baseline</p>
        </div>
      </div>

      {/* 2-Column: Funnel & Manager Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Hiring Pipeline Funnel (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Active Hiring Funnel Conversion
                </h2>
                <p className="text-xs text-slate-500">Real-time candidate transition through Sprint stages</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                Sprint 8 Live
              </span>
            </div>

            <div className="flex flex-col gap-4 mt-5">
              {funnelStages.map((stage) => (
                <div key={stage.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>{stage.label}</span>
                    <span className="tabular-nums">
                      <strong className="text-slate-900">{stage.count}</strong>{" "}
                      <span className="text-slate-400 font-normal">({stage.percentage})</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-blue-600 ${stage.barWidth} transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Conversion Efficiency: <strong className="text-slate-800">3.2% to Offer</strong></span>
            <Link to="/recruiter/candidates" className="text-blue-600 hover:underline font-semibold">
              Explore Candidate Pipeline →
            </Link>
          </div>
        </div>

        {/* Right: Urgent Action Center (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Action Items Needed
              </h2>
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                {actionItems.length} Pending
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {actionItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  ✓ All recruiter action items cleared!
                </div>
              ) : (
                actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.urgency === "high"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.count} items
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.reason}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <Link to={item.link}>
                        <Button variant="primary" size="sm">
                          {item.actionText}
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleResolveAction(item.id, item.title)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Mark Handled
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              High Priority Candidate Dossiers
            </h2>
            <p className="text-xs text-slate-500">Shortlisted applicants with verified AI scores above 80%</p>
          </div>
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Filter list by candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Applied Position</th>
                <th className="py-3 px-4">AI Match</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Evaluation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {cand.initials}
                      </div>
                      <span className="font-semibold text-slate-900">{cand.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {cand.role}
                  </td>
                  <td className="py-3.5 px-4">
                    {aiMatchBadge(cand.matchScore)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      variant={cand.stage === "Interviewing" ? "interviewing" : cand.stage === "Offer Stage" ? "offer" : "screened"}
                      label={cand.stage}
                      dot
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-semibold ${
                        cand.reviewStatus === "Approved"
                          ? "text-emerald-600"
                          : cand.reviewStatus === "Ready"
                          ? "text-blue-600"
                          : "text-amber-600"
                      }`}
                    >
                      {cand.reviewStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link to={cand.link}>
                      <Button variant="secondary" size="sm">
                        {cand.action} ›
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notice */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in duration-150"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}