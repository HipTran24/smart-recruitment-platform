import React, { useState } from "react";

interface CandidateRow {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  avatarBg: string;
  matchScore: string;
  matchRank: string;
  matchHighlight?: boolean;
  experience: string;
  location: string;
  salaryNote: string;
  salaryPositive?: boolean;
  tags: string[];
  alertTag?: string;
  actionText: "Advance" | "Review";
}

export default function BulkCandidateScreeningHub() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["HL"]);
  const [activeInspectorId, setActiveInspectorId] = useState<string>("HL");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const candidates: CandidateRow[] = [
    {
      id: "HL",
      name: "Harriet Lawrence",
      role: "Lead UX Researcher",
      company: "Ex-FinTech",
      initials: "HL",
      avatarBg: "bg-blue-600",
      matchScore: "92% Match",
      matchRank: "Top 2% of Inflow",
      matchHighlight: true,
      experience: "7.2 Yrs Senior",
      location: "San Francisco, CA (Hybrid)",
      salaryNote: "Salary: within band",
      salaryPositive: true,
      tags: ["Design Systems", "Quant/Qual"],
      actionText: "Advance",
    },
    {
      id: "MB",
      name: "Marcus Broadus",
      role: "Staff Product Designer",
      company: "CloudCorp",
      initials: "MB",
      avatarBg: "bg-slate-200 text-slate-700",
      matchScore: "88% Match",
      matchRank: "High Technical Fit",
      experience: "8.5 Yrs Staff",
      location: "Seattle, WA (Remote)",
      salaryNote: "Notice: 30 days",
      tags: ["Token Arch", "React Hooks"],
      actionText: "Advance",
    },
    {
      id: "SK",
      name: "Sonia Khavis",
      role: "Senior UX Researcher",
      company: "Studio Labs",
      initials: "SK",
      avatarBg: "bg-slate-200 text-slate-700",
      matchScore: "81% Match",
      matchRank: "Needs Review",
      experience: "5.0 Yrs Senior",
      location: "Austin, TX (Hybrid)",
      salaryNote: "Comp: Unstated",
      tags: ["Diary Studies"],
      alertTag: "Sys Gap",
      actionText: "Review",
    },
    {
      id: "DC",
      name: "David Chen",
      role: "Lead Interaction Designer",
      company: "OmniTech",
      initials: "DC",
      avatarBg: "bg-slate-200 text-slate-700",
      matchScore: "85% Match",
      matchRank: "Tier 1 Bench",
      experience: "6.4 Yrs Lead",
      location: "New York, NY (Onsite)",
      salaryNote: "Notice: Immediate",
      salaryPositive: true,
      tags: ["Design Ops", "Motion UX"],
      actionText: "Advance",
    },
    {
      id: "ER",
      name: "Elena Rostova",
      role: "UX Researcher & Strategist",
      company: "ScaleUp",
      initials: "ER",
      avatarBg: "bg-slate-200 text-slate-700",
      matchScore: "78% Match",
      matchRank: "Mid Pipeline",
      experience: "4.1 Yrs Mid",
      location: "Chicago, IL (Remote)",
      salaryNote: "Notice: 2 Weeks",
      tags: ["B2B SaaS", "Surveys"],
      actionText: "Review",
    },
  ];

  const toggleSelectCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 font-sans antialiased text-xs">
        {/* Top Navbar */}
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
            <span>Workspace</span>
            <span>/</span>
            <span>Candidates</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Bulk Candidate Screening &amp; Quick Decision Hub</span>
            <span className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[9px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidates by name, skill, requisition... ⌘K"
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

        {/* Content Body */}
        <main className="p-6 max-w-[1500px] w-full mx-auto space-y-4">
          {/* Header Action Bar */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Bulk Candidate Screening &amp; Quick Decision Hub
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  HITL CALIBRATED
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Batch triage applicants, calibrate deterministic AI match rubrics, and execute pipeline routing with recruiter sign-off.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none">
                <option>#REQ-2026-084: Lead UX Res... 142 Inflow • 18 Shortlisted</option>
              </select>

              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-slate-600">
                <button className="px-2 py-1 font-semibold hover:bg-slate-50 rounded">Grid</button>
                <button className="px-2 py-1 font-bold bg-blue-50 text-blue-700 rounded shadow-sm">
                  Split Inspector
                </button>
                <button className="px-2 py-1 font-semibold hover:bg-slate-50 rounded text-slate-400">
                  Speed [J/K]
                </button>
              </div>

              <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5">
                <span>✓</span> Commit Decisions
                <span className="text-[10px] font-normal text-blue-200 ml-1">Saved 45s ago</span>
              </button>
            </div>
          </div>

          {/* 4 Thẻ chỉ số tổng quan */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  TOTAL INFLOW QUEUE
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black text-slate-900">142</span>
                  <span className="text-[11px] text-emerald-600 font-bold">+24 today</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  ● 98 parsed without schema errors
                </span>
              </div>
              <span className="text-blue-500 text-base">📥</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div className="w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI MATCH DISTRIBUTION
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900">18</span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1 rounded border border-blue-200">
                    Tier 1 (&gt;85%)
                  </span>
                </div>
                {/* Thanh tiến trình Match */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-blue-600 h-full rounded-full w-[45%]" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>18 Top</span>
                  <span>46 Mid</span>
                  <span>78 Review</span>
                </div>
              </div>
              <span className="text-slate-400 text-sm ml-2">📊</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ACTIVE TRIAGE BATCH
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900">12</span>
                  <span className="text-[11px] text-slate-500">selected for review</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    4 Fast-Track Flagged
                  </span>
                  <span className="text-[10px] text-slate-400">Batch #4</span>
                </div>
              </div>
              <span className="text-blue-500 text-base">📑</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  POLICY &amp; FAIRNESS SHIELD
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900">100%</span>
                  <span className="text-[11px] text-slate-500">Human-in-Loop</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  ✓ Autonomous rejection locks active
                </span>
              </div>
              <span className="text-emerald-500 text-base">🛡️</span>
            </div>
          </div>

          {/* Thanh Filter & Search */}
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Q Figma, Systems, Qualitative"
                  className="w-full h-8 pl-7 pr-3 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select className="h-8 bg-white border border-slate-200 rounded-lg px-2.5 text-slate-700 font-medium">
                <option>Score: ≥ 80%</option>
              </select>

              <select className="h-8 bg-white border border-slate-200 rounded-lg px-2.5 text-slate-700 font-medium">
                <option>Experience: 5+ Yrs Senior</option>
              </select>

              <select className="h-8 bg-white border border-slate-200 rounded-lg px-2.5 text-slate-700 font-medium">
                <option>Status: Pending Review</option>
              </select>

              <button className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-blue-600 font-semibold hover:bg-slate-50">
                ⚡ More Filters (3)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold text-[10px] uppercase">Sort By:</span>
              <select className="h-8 bg-white border border-slate-200 rounded-lg px-2.5 font-bold text-slate-800">
                <option>AI Match Score (High to Low) ↓</option>
              </select>
            </div>
          </div>

          {/* Dải Action Nhanh Cho Batch Đang Chọn */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[11px]">
                {selectedIds.length} of 142 Selected
              </span>
              <span className="text-slate-600 text-[11px]">
                Bulk actions will trigger recruiter confirmation modal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1">
                <span>▶</span> Batch Advance to Interview ({selectedIds.length})
              </button>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg flex items-center gap-1">
                <span>✉</span> Request Portfolio Info (2)
              </button>
              <button className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg flex items-center gap-1">
                <span>✕</span> Batch Pass (2)
              </button>
              <button className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg">
                📥
              </button>
            </div>
          </div>

          {/* Lưới 2 Cột: Bảng Triage Bên Trái (7/12) & Inspector Chi Tiết Bên Phải (5/12) */}
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* Cột Trái: Bảng Triage (7/12) */}
            <div className="col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">Triage Candidate Matrix</span>
                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
                    Cohort Alpha
                  </span>
                </div>
                <span className="text-slate-400 text-[10px]">
                  Quick Key: <kbd className="border bg-white px-1 rounded font-mono">k</kbd> Advance •{" "}
                  <kbd className="border bg-white px-1 rounded font-mono">x</kbd> Pass
                </span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 px-4 py-2 border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === candidates.length}
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600"
                  />
                </div>
                <div className="col-span-5">CANDIDATE</div>
                <div className="col-span-2 text-center">AI MATCH</div>
                <div className="col-span-3">EXPERIENCE &amp; FIT</div>
                <div className="col-span-1 text-right">ACTION</div>
              </div>

              {/* Danh sách hàng ứng viên */}
              <div className="divide-y divide-slate-100">
                {candidates.map((c) => {
                  const isChecked = selectedIds.includes(c.id);
                  const isActive = activeInspectorId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveInspectorId(c.id)}
                      className={`grid grid-cols-12 px-4 py-3 items-center cursor-pointer transition ${
                        isActive
                          ? "bg-blue-50/40 border-l-4 border-l-blue-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectCandidate(c.id)}
                          className="rounded text-blue-600"
                        />
                      </div>

                      {/* Thông tin ứng viên */}
                      <div className="col-span-5 flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${c.avatarBg}`}
                        >
                          {c.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs truncate">{c.name}</span>
                            {c.id === "HL" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {c.role} • <span className="text-slate-400">{c.company}</span>
                          </p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {c.tags.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-medium"
                              >
                                {t}
                              </span>
                            ))}
                            {c.alertTag && (
                              <span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[9px] font-bold">
                                {c.alertTag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Điểm AI Match */}
                      <div className="col-span-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.matchHighlight
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.matchScore}
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-0.5 truncate">
                          {c.matchRank}
                        </span>
                      </div>

                      {/* Kinh nghiệm & Fit */}
                      <div className="col-span-3 text-[10px] leading-tight space-y-0.5">
                        <span className="font-bold text-slate-800 block">{c.experience}</span>
                        <span className="text-slate-400 block truncate">{c.location}</span>
                        <span
                          className={`block font-semibold ${
                            c.salaryPositive ? "text-emerald-600" : "text-slate-500"
                          }`}
                        >
                          {c.salaryNote}
                        </span>
                      </div>

                      {/* Nút hành động */}
                      <div className="col-span-1 text-right flex items-center justify-end gap-1">
                        <button
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            c.actionText === "Advance"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {c.actionText}
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 text-xs">⋮</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phân trang */}
              <div className="px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 bg-white">
                <span>Showing 1-5 of 142 applicants</span>
                <div className="flex items-center gap-1 font-semibold">
                  <button className="px-1.5 py-0.5 border rounded hover:bg-slate-50 text-slate-400">‹</button>
                  <button className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">1</button>
                  <button className="px-2 py-0.5 rounded hover:bg-slate-100">2</button>
                  <button className="px-2 py-0.5 rounded hover:bg-slate-100">3</button>
                  <span>...</span>
                  <button className="px-2 py-0.5 rounded hover:bg-slate-100">12</button>
                  <button className="px-1.5 py-0.5 border rounded hover:bg-slate-50">›</button>
                </div>
              </div>

              {/* Thanh phím tắt Speed Navigation */}
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-600">⚡ Speed Navigation:</span>
                  <span><kbd className="border bg-white px-1 rounded font-mono">J</kbd> Next</span>
                  <span><kbd className="border bg-white px-1 rounded font-mono">K</kbd> Prev</span>
                  <span><kbd className="border bg-white px-1 rounded font-mono">Space</kbd> Toggle Select</span>
                  <span><kbd className="border bg-white px-1 rounded font-mono">↵</kbd> Advance</span>
                </div>
                <span>Hit "?" for all shortcuts</span>
              </div>
            </div>

            {/* Cột Phải: Split Inspector Chi Tiết Ứng Viên (5/12) */}
            <div className="col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
              {/* Header Inspector */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    HL
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">Harriet Lawrence</h3>
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                        92% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Lead UX Researcher • San Francisco, CA
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Benchmark Target: Exceeds Requisition Bar
                    </span>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">↗</button>
              </div>

              {/* Blind Triage Guard Active */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2">
                <span className="text-emerald-600 text-xs font-bold mt-0.5">🛡️</span>
                <p className="text-[10px] text-emerald-800 leading-tight">
                  <strong>Blind Triage Guard Active:</strong> PII, age, institutions, and geographic bias variables have been sanitized for calibrated scoring.
                </p>
              </div>

              {/* Rubric Competency Fit */}
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>RUBRIC COMPETENCY FIT</span>
                  <span className="text-blue-600 font-semibold">vs REQ Benchmark</span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-0.5 text-xs">
                    <span>User Research &amp; Synthesis</span>
                    <span className="text-emerald-600 font-bold">+16% vs Bar • 96%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full w-[96%]" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Verified by 14-month continuous discovery portfolio and published framework.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-0.5 text-xs">
                    <span>Design Tokens &amp; System Integration</span>
                    <span className="text-slate-700 font-bold">Target Bar • 90%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full w-[90%]" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Multi-brand token governance across Figma &amp; React architecture.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-0.5 text-xs">
                    <span>Product Leadership &amp; Strategy</span>
                    <span className="text-slate-700 font-bold">88%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full w-[88%]" />
                  </div>
                </div>
              </div>

              {/* Comp & Availability */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    COMP &amp; AVAILABILITY
                  </span>
                  <span className="font-bold text-slate-900">$175k – $185k • 2 Weeks</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  ● In Requisition Band
                </span>
              </div>

              {/* Evidence Citations (Verified) */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>EVIDENCE CITATIONS (VERIFIED)</span>
                  <span>Page 2 CV • Case 3</span>
                </div>
                <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-200 text-[11px] leading-relaxed">
                  "Pioneered mixed-methods discovery cadence across 8 product squads, shortening prototype validation cycle from 21 days to 4 days."
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-medium border">
                    Source: FinTech Case Study
                  </span>
                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-medium border">
                    Verified GitHub PRs
                  </span>
                </div>
              </div>

              {/* Screening Note For Interview Panel */}
              <div className="space-y-1 text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  SCREENING NOTE FOR INTERVIEW PANEL
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pre-screen verified. Outstanding research rigor in complex scaleup. Recommend advancing directly to Round 2 Architecture Panel.
                </p>
              </div>

              {/* Nút hành động Triage trong Inspector */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <button className="py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
                  ✕ Pass
                </button>
                <button className="py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
                  ⏸ Hold / Waitlist
                </button>
                <button className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center justify-center gap-1">
                  ✓ Advance (R2)
                </button>
              </div>

              {/* Engineering Manager Synced Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">
                    ENGINEERING MANAGER SYNCED
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px]">
                    Endorsed
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-xs">Alex V. reviewed portfolio</p>
                <p className="text-slate-500 text-[10px] italic leading-tight">
                  "Harriet's token taxonomy architecture matches our design-ops overhaul roadmap. Definite thumbs up for Round 2."
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}