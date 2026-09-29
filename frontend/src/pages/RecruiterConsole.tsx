import { useMemo, useState } from "react";

export default function RecruiterConsole() {
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState("Overview");
  const [posted, setPosted] = useState(false);
  const [approvedCandidates, setApprovedCandidates] = useState<string[]>([]);

  const candidates = [
    { initials: "HL", name: "Harriet Lawrence", role: "Lead UX Researcher", match: "92% Match", matchClass: "bg-blue-50 text-blue-700", stage: "Interviewing", feedback: "Draft: Ready", action: "Approve & Send", primary: true },
    { initials: "MB", name: "Marcus Broadus", role: "Senior Backend Dev", match: "86% Match", matchClass: "bg-blue-50 text-blue-700", stage: "Offer Stage", feedback: "Approved", action: "View Dossier", primary: false },
    { initials: "SK", name: "Sonia Khavis", role: "Product Marketing Lead", match: "78% Match", matchClass: "bg-orange-50 text-amber-600", stage: "Screened", feedback: "Needs Review", action: "Evaluate", primary: false },
  ];

  const filteredCandidates = useMemo(() => {
    if (!search.trim()) return candidates;
    return candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Workspace / <span className="text-slate-900">Manager</span></p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-2.5 py-1 bg-emerald-50 text-green-600 rounded-full border border-emerald-200 text-xs font-semibold">• Live Sync</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants..."
            className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hiring Operations Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage requisitions, AI candidate matching, and feedback approvals</p>
        </div>
        <button
          onClick={() => setPosted(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
        >
          {posted ? "Job Posted" : "+ Post New Job"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "OPEN REQUISITIONS", value: "12", detail: "+2 this week", color: "text-green-600" },
          { label: "TOTAL APPLICANTS", value: "184", detail: "142 AI-Screened", color: "text-blue-600" },
          { label: "PENDING APPROVALS", value: "9", detail: "Feedback drafts & rubrics", color: "text-amber-600" },
          { label: "AVG TIME TO HIRE", value: "14.2 days", detail: "-1.6d vs target", color: "text-green-600" },
        ].map((stat, index) => (
          <div key={index} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm">
            <span className="text-slate-500 text-xs font-bold">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className={`text-xs font-medium ${stat.color}`}>{stat.detail}</span>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold mb-4">Candidate Pipeline & AI Match Matrix</h2>
        <div className="grid grid-cols-6 text-slate-500 text-xs font-bold pb-3 border-b border-slate-200">
          <div>CANDIDATE</div>
          <div>APPLIED ROLE</div>
          <div>AI MATCH</div>
          <div>PIPELINE STAGE</div>
          <div>FEEDBACK/APPROVAL</div>
          <div className="text-right">ACTION</div>
        </div>
        {filteredCandidates.map((candidate) => {
          const approved = approvedCandidates.includes(candidate.name);
          return (
            <div key={candidate.name} className="grid grid-cols-6 items-center py-3.5 border-b border-slate-100 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">{candidate.initials}</div>
                <span className="font-semibold">{candidate.name}</span>
              </div>
              <div className="text-slate-500">{candidate.role}</div>
              <div><span className={`px-2 py-0.5 rounded text-xs font-bold ${candidate.matchClass}`}>{candidate.match}</span></div>
              <div className="font-medium">{candidate.stage}</div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="text-slate-700 text-xs">{approved ? "Approved" : candidate.feedback}</span>
              </div>
              <div className="text-right">
                <button
                  onClick={() => candidate.primary && setApprovedCandidates(curr => [...curr, candidate.name])}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                    candidate.primary ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white border border-slate-200 text-slate-900"
                  }`}
                >
                  {approved ? "Sent" : candidate.action}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}