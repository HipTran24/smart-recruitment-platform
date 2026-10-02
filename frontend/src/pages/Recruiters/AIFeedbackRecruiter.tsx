import React, { useState } from "react";

interface CandidateFeedback {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  statusBadge: string;
  statusText: string;
  decisionText: string;
  decisionClass: string;
  score: string;
  consensus?: string;
  highlight: string;
  subMeta: string;
  actionAvailable?: boolean;
}

export default function AIFeedbackDraftStudio() {
  const [activeTab, setActiveTab] = useState("Pending Review");
  const [selectedCandidateId, setSelectedCandidateId] = useState("HL");
  const [deliveryTone, setDeliveryTone] = useState("Professional & Warm");
  const [feedbackDepth, setFeedbackDepth] = useState("Competency Breakdown");
  const [subjectLine, setSubjectLine] = useState(
    "Update on your Lead UX Researcher application at Acme Corp — Panel Feedback & Next Steps"
  );

  const candidatesList: CandidateFeedback[] = [
    {
      id: "HL",
      name: "Harriet Lawrence",
      role: "Lead UX Researcher",
      initials: "HL",
      avatarBg: "bg-blue-600",
      statusBadge: "bg-blue-50 text-blue-700 border-blue-200",
      statusText: "Ready for Review",
      decisionText: "↗ Advancing: Offer Stage",
      decisionClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      score: "4.55/5.0",
      consensus: "Consensus: 90.4%",
      highlight:
        "Key Highlight: Exemplary user research loops, validated heuristic audit rigor & enterprise design token system governance.",
      subMeta: "⚡ 12m ago • Gemini 2.5 Flash",
      actionAvailable: true,
    },
    {
      id: "MB",
      name: "Marcus Broadus",
      role: "Senior Backend Dev",
      initials: "MB",
      avatarBg: "bg-slate-200 text-slate-700",
      statusBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      statusText: "Approved • 16:30",
      decisionText: "Offer Extended",
      decisionClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      score: "4.40/5.0",
      highlight:
        "High distributed transactions mastery, verified concurrency testing.",
      subMeta: "Dispatches today at 4:30 PM",
    },
    {
      id: "SK",
      name: "Sonia Khavis",
      role: "Product Marketing Lead",
      initials: "SK",
      avatarBg: "bg-slate-200 text-slate-700",
      statusBadge: "bg-slate-100 text-slate-700 border-slate-200",
      statusText: "Draft Ready",
      decisionText: "Constructive Pass",
      decisionClass: "bg-slate-100 text-slate-700 border-slate-200",
      score: "3.10/5.0",
      highlight:
        "Solid brand positioning; needs stronger data instrumentation for multi-touch attribution modeling.",
      subMeta: "● Constructive Feedback Active • 2h ago",
    },
    {
      id: "DC",
      name: "David Chen",
      role: "Staff Frontend Engineer",
      initials: "DC",
      avatarBg: "bg-slate-200 text-slate-700",
      statusBadge: "bg-amber-50 text-amber-700 border-amber-200",
      statusText: "Pending Panel",
      decisionText: "Awaiting Final Rubric (2/3 complete)",
      decisionClass: "bg-amber-50 text-amber-700 border-amber-200",
      score: "Pending",
      highlight: "Interviewer: Sarah Lin pending",
      subMeta: "Waiting on 1 remaining evaluation",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 font-sans antialiased text-xs">
        {/* Top Navbar */}
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
            <span>Workspace</span>
            <span>/</span>
            <span>Evaluations &amp; Feedback</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">AI Feedback Draft Review &amp; Dispatch</span>
            <span className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[9px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search feedback drafts, candidate emails, rubrics... ⌘K"
                className="w-72 h-7 pl-7 pr-3 text-[11px] bg-slate-50 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="text-slate-400 hover:text-slate-600 relative">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5" />
            </button>
            <button className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 flex items-center gap-1">
              <span>+</span> Post New Job
            </button>
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              AJ
            </div>
          </div>
        </header>

        {/* Nội dung bên trong */}
        <main className="p-6 max-w-[1500px] w-full mx-auto space-y-4">
          {/* Tiêu đề trang & Action buttons */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  AI Feedback Draft Review &amp; Dispatch Studio
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  🛡️ GUARDRAIL ENFORCED
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Curate, calibrate, and dispatch personalized candidate feedback synthesized from structured interview scorecards with full human oversight.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none">
                <option>REQ: #REQ-2026-084: Lead UX Researcher</option>
              </select>
              <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
                <span>🛡️</span> Compliance Policy
              </button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5">
                <span>✓</span> Batch Approve Clear (2)
              </button>
            </div>
          </div>

          {/* Hàng trạng thái model AI & Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 text-xs">
            <div className="flex items-center gap-2">
              {[
                { name: "Pending Review", count: 3 },
                { name: "Approved & Scheduled", count: 2 },
                { name: "Needs Recalibration", count: 1 },
                { name: "Dispatched Archive", count: 86 },
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
                    activeTab === tab.name
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                      activeTab === tab.name
                        ? "bg-blue-800 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                ● Gemini 2.5 Flash Online
              </span>
              <span>•</span>
              <span>Temp: 0.3</span>
              <span>•</span>
              <span>Lat: 820ms</span>
            </div>
          </div>

          {/* Bố cục 2 Cột chính: Danh sách ứng viên bên trái & Editor bên phải */}
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* Cột Trái: Danh sách ứng viên (4/12) */}
            <div className="col-span-4 space-y-3">
              {/* Thanh lọc tìm kiếm */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter candidate, role, or score..."
                    className="w-full h-8 pl-8 pr-3 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <select className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-600 font-medium">
                    <option>All Decisions</option>
                  </select>
                  <select className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-600 font-medium">
                    <option>All Review States</option>
                  </select>
                </div>
              </div>

              {/* Danh sách thẻ ứng viên */}
              <div className="space-y-2.5">
                {candidatesList.map((c) => {
                  const isSelected = selectedCandidateId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidateId(c.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer relative shadow-sm ${
                        isSelected
                          ? "bg-white border-blue-600 ring-1 ring-blue-600"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-[10px] ${c.avatarBg}`}
                          >
                            {c.initials}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-xs leading-none">
                              {c.name}
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">{c.role}</p>
                          </div>
                        </div>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${c.statusBadge}`}
                        >
                          {c.statusText}
                        </span>
                      </div>

                      {/* Chi tiết đánh giá */}
                      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${c.decisionClass}`}
                        >
                          {c.decisionText}
                        </span>
                        {c.score !== "Pending" && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">
                            Score: {c.score}
                          </span>
                        )}
                        {c.consensus && (
                          <span className="text-[9px] text-slate-400 font-medium">
                            {c.consensus}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed line-clamp-2">
                        {c.highlight}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                        <span>{c.subMeta}</span>
                        {c.actionAvailable && (
                          <span className="text-blue-600 font-bold hover:underline">
                            Calibrate →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chỉ số vận tốc Candidate Experience */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  CANDIDATE EXPERIENCE VELOCITY
                </span>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-xl font-black text-slate-900 block leading-tight">4.2h</span>
                    <span className="text-[10px] text-slate-500">Avg Time to Feedback</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">↓ 38% vs Q3 SLA</span>
                  </div>
                  <div>
                    <span className="text-xl font-black text-emerald-600 block leading-tight">98.4%</span>
                    <span className="text-[10px] text-slate-500">Human Edit Rate</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">100% Policy Adherence</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột Phải: Trình xem & Hiệu chỉnh Feedback Draft (8/12) */}
            <div className="col-span-8 space-y-3">
              {/* Alert: Human-in-the-Loop Guardrail Active */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  🛡️
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs">
                      Human-in-the-Loop Guardrail Active
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      ● READY FOR RECRUITER SIGN-OFF
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    AI candidate drafts are never dispatched autonomously. Review tone alignment, verify rubric evidence anchors, and calibrate sensitive messaging before authorized dispatch.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                      Prompt: candidate-feedback-v1.2
                    </span>
                    <span>•</span>
                    <span>Temp: 0.3</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">Anchors: 4 Scorecards Synthesized</span>
                  </div>
                </div>
              </div>

              {/* Form Người nhận, Người gửi & Tiêu đề */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CANDIDATE RECIPIENT
                    </label>
                    <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        👤 Harriet Lawrence <span className="text-slate-400 font-normal">&lt;harriet.lawrence@uxstudio.dev&gt;</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      SENDER AUTHORITY (FROM)
                    </label>
                    <div className="p-2 border border-slate-200 rounded-lg bg-white flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        💼 Alex Johnson (Lead Recruiter) <span className="text-slate-400 font-normal">&lt;alex.johnson@smartrecruit.io&gt;</span>
                      </span>
                      <span className="text-slate-400">▾</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      SUBJECT LINE
                    </label>
                    <button className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
                      ✨ Optimize
                    </button>
                  </div>
                  <input
                    type="text"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tùy chỉnh Giọng điệu & Độ sâu Feedback */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      1. DELIVERY TONE
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {["Professional & Warm", "Direct & Concise", "Mentorship & Growth", "Executive Formal"].map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setDeliveryTone(tone)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                            deliveryTone === tone
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      2. FEEDBACK DEPTH
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {["Standard", "Competency Breakdown", "Actionable Roadmap"].map((depth) => (
                        <button
                          key={depth}
                          onClick={() => setFeedbackDepth(depth)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                            feedbackDepth === depth
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {depth}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Include Interview Rubric Strengths</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Include Next Steps &amp; Offer Timeline</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-600" />
                      <span>Attach Anonymized Scorecard PDF</span>
                    </label>
                  </div>

                  <button className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                    🔄 Regenerate Draft with Controls
                  </button>
                </div>
              </div>

              {/* Trình soạn thảo văn bản phản hồi & Cột Rubric Anchors */}
              <div className="grid grid-cols-12 gap-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* Trình soạn thảo (8/12) */}
                <div className="col-span-8 p-4 border-r border-slate-200 space-y-3">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500">
                    <div className="flex items-center gap-2">
                      <button className="font-bold hover:text-slate-800">B</button>
                      <button className="italic hover:text-slate-800">I</button>
                      <button className="underline hover:text-slate-800">U</button>
                      <div className="h-3 w-px bg-slate-300" />
                      <button className="hover:text-slate-800">≡</button>
                      <button className="hover:text-slate-800">⋮≡</button>
                      <button className="hover:text-slate-800">🔗</button>
                      <button className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold px-1 py-0.5 rounded border border-slate-200">
                        <span>{"{ }"} Insert Dynamic Variable</span> ▾
                      </button>
                    </div>

                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      ● Live Anchored to 4 Scorecards
                    </span>
                  </div>

                  {/* Vùng soạn thảo nội dung */}
                  <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                    <p>Hi <strong className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">Harriet</strong>,</p>
                    <p>
                      Thank you for spending time with our product and design leadership team yesterday for the final panel review for the <strong>Lead UX Researcher</strong> role at Acme Corp.
                    </p>
                    <p>
                      On behalf of the hiring panel—Alex Johnson (Lead Recruiter), Marcus Broadus (Engineering Lead), and Sarah Lin (VP of Product Design)—I am thrilled to share that our evaluation was overwhelmingly positive, and we are preparing to extend a formal offer.
                    </p>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <p className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                        👍 Highlights &amp; Evaluator Strengths:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                        <li>
                          <strong>Usability Discovery Rigor:</strong> Your 14-month continuous discovery loop presentation demonstrated world-class methodology in quantitative synthesis and participant sampling.
                        </li>
                        <li>
                          <strong>Cross-Functional Design System Governance:</strong> The panel particularly praised how you align user research tokens with engineering accessibility constraints without creating cycle friction.
                        </li>
                      </ul>
                    </div>

                    <p>
                      Please let us know if you have any questions in the meantime. We are genuinely excited about the prospect of having you lead our research organization!
                    </p>

                    <div className="pt-2 text-slate-800">
                      <p>Warm regards,</p>
                      <p className="font-bold">Alex Johnson</p>
                      <p className="text-[11px] text-slate-500">Lead Recruiter, Product &amp; Design Talent • Acme Corp</p>
                    </div>
                  </div>
                </div>

                {/* Scorecard Evidence Anchors (4/12) */}
                <div className="col-span-4 p-3.5 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      SCORECARD EVIDENCE ANCHORS
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold">100% Sourced</span>
                  </div>

                  <div className="space-y-2 text-[10px]">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-900">Discovery Rigor</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1 rounded">4.8 / 5.0</span>
                      </div>
                      <p className="text-slate-500 italic">"Harriet's continuous discovery case study was the strongest seen this quarter."</p>
                      <div className="flex justify-between text-slate-400 text-[9px] pt-0.5">
                        <span>Evaluator: Sarah Lin (VP Design)</span>
                        <button className="text-blue-600 hover:underline">View Rubric</button>
                      </div>
                    </div>

                    <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-900">Design System Tokens</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1 rounded">4.6 / 5.0</span>
                      </div>
                      <p className="text-slate-500 italic">"Understands engineering handoff realities; great grip on WCAG AAA research."</p>
                      <div className="flex justify-between text-slate-400 text-[9px] pt-0.5">
                        <span>Evaluator: Marcus Broadus (Eng)</span>
                        <button className="text-blue-600 hover:underline">View Rubric</button>
                      </div>
                    </div>

                    <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-900">Leadership &amp; Strategy</span>
                        <span className="text-blue-700 bg-blue-50 px-1 rounded">4.2 / 5.0</span>
                      </div>
                      <p className="text-slate-500 italic">"Clear roadmap vision; needs active support aligning research cadence to sprints."</p>
                    </div>
                  </div>

                  {/* Guardrail Health Check */}
                  <div className="pt-2 border-t border-slate-200 space-y-1 text-[10px]">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      GUARDRAIL HEALTH CHECK
                    </span>
                    <p className="text-emerald-700 flex items-center gap-1 font-semibold">
                      ✓ DEI &amp; Bias Neutrality: Passed
                    </p>
                    <p className="text-emerald-700 flex items-center gap-1 font-semibold">
                      ✓ No unredacted PII or internal salary codes
                    </p>
                    <p className="text-emerald-700 flex items-center gap-1 font-semibold">
                      ✓ Non-binding language compliant
                    </p>
                  </div>
                </div>
              </div>

              {/* Thanh ký duyệt & Dispatch Action Bar ở dưới */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                    AJ
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Autosaved 1 min ago</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">
                      Sign-off Authority: Alex Johnson (Recruiter ID #REC-8841)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-md transition">
                    Discard Draft
                  </button>
                  <button className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition">
                    Save Draft
                  </button>
                  <button className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition flex items-center gap-1">
                    <span>✉</span> Send Test Preview
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md transition">
                    🕒 Approve &amp; Schedule
                  </button>
                  <button
                    onClick={() => alert("Feedback Approved & Dispatched Successfully!")}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>✓</span> Approve &amp; Dispatch Feedback ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}