import React, { useState } from "react";

export default function InterviewCalendar() {
  const [activeTab, setActiveTab] = useState("Week");
  const [selectedFormat, setSelectedFormat] = useState("Google Meet");
  const [selectedCandidate, setSelectedCandidate] = useState(
    "Harriet Lawrence (92% AI Match • Lead UX)"
  );
  const [selectedPanelist, setSelectedPanelist] = useState("All Panelists");

  const panelists = [
    "All Panelists",
    "Alex J. (Lead)",
    "Marcus B. (Dev)",
    "Sarah L. (VP)",
  ];

  const days = [
    { name: "MON", date: "Oct 02", isToday: false },
    { name: "TUE (TODAY)", date: "Oct 03", isToday: true },
    { name: "WED", date: "Oct 04", isToday: false },
    { name: "THU", date: "Oct 05", isToday: false },
    { name: "FRI", date: "Oct 06", isToday: false },
  ];

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 font-sans antialiased text-xs">
        {/* Top Navbar */}
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>Workspace</span>
            <span>/</span>
            <span>Interview Calendar</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Recruiting Operations</span>
            <span className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search requisitions, candidates, calendars... ⌘K"
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Interview Calendar &amp; Scheduling Hub
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  v1.1 LIVE HUB
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Coordinate panel schedules, multi-interviewer availability sync, meeting links, and candidate slots
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
                <span>🔄</span> Sync (Google/Outlook)
              </button>
              <button className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg flex items-center gap-1.5">
                <span>✨</span> Auto-Slot Finder (AI)
              </button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5">
                <span>+</span> Schedule Interview Slot
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Requisition:
              </span>
              <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 focus:outline-none">
                <option>#REQ-2026-084 : Lead UX Researcher</option>
                <option>#REQ-2026-085 : Senior Backend Developer</option>
              </select>

              <div className="flex items-center gap-1 border border-slate-200 bg-white rounded-lg p-0.5 text-slate-600">
                <button className="px-2 py-0.5 font-bold hover:bg-slate-50 rounded">Today</button>
                <div className="flex items-center gap-1 px-1.5 font-semibold text-slate-700">
                  <button className="hover:text-blue-600">‹</button>
                  <span>Oct 02 – Oct 08, 2026</span>
                  <button className="hover:text-blue-600">›</button>
                </div>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              {["Day", "Week", "Month", "Agenda"].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveTab(view)}
                  className={`px-3 py-1 font-semibold rounded-md transition ${
                    activeTab === view
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Thẻ Thống Kê 4 Ô */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  SCHEDULED INTERVIEWS
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900">18</span>
                  <span className="text-[11px] text-slate-500">Sessions</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  ↗ +4 scheduled this week
                </span>
              </div>
              <span className="text-blue-600 text-base">📅</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PANEL UTILIZATION
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black text-slate-900">74.5%</span>
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                    Healthy
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Target capped at ≤4h/day per interviewer
                </span>
              </div>
              <span className="text-emerald-600 text-base">⏱️</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PENDING CONFIRMATIONS
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900">3</span>
                  <span className="text-[11px] text-slate-500">Awaiting response</span>
                </div>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                  • 2 candidates • 1 panelist
                </span>
              </div>
              <span className="text-amber-500 text-base">⏳</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI CONFLICT DETECTION
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-emerald-600">0 Conflicts</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  ● Live auto-resolution active
                </span>
              </div>
              <span className="text-blue-500 text-base">🪄</span>
            </div>
          </div>

          {/* Panel Filters & Legend */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-[11px] flex items-center gap-1">
                📍 San Francisco (GMT-7) • Candidate times automatically normalized
              </span>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[10px] uppercase">
                  Interviewer:
                </span>
                {panelists.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedPanelist(name)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      selectedPanelist === name
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span>LEGEND:</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirmed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Reserved
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="border border-slate-200 px-1 rounded">R1: Screen</span>
                <span className="border border-blue-300 text-blue-600 bg-blue-50 px-1 rounded font-bold">R2: Architecture</span>
                <span className="border border-slate-200 px-1 rounded">R3: Exec</span>
              </div>
            </div>
          </div>

          {/* Grid Layout Lịch & Đặt Lịch Nhanh */}
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* Cột Lịch Biểu Tuần (8/12) */}
            <div className="col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {/* Header Thứ & Ngày */}
              <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50/70 text-center font-bold">
                <div className="py-2.5 text-slate-400 text-[10px] border-r border-slate-200">
                  TIME (PST)
                </div>
                {days.map((day) => (
                  <div
                    key={day.name}
                    className={`py-2 border-r border-slate-200 last:border-r-0 ${
                      day.isToday ? "bg-blue-50/80 text-blue-700" : "text-slate-700"
                    }`}
                  >
                    <div className="text-[10px] tracking-tight">{day.name}</div>
                    <div className="text-xs font-black">{day.date}</div>
                  </div>
                ))}
              </div>

              {/* Lưới Giờ và Khung Lịch */}
              <div className="divide-y divide-slate-100 relative min-h-[500px]">
                {/* Dòng giờ hiện tại đỏ (Red Current Time Line Indicator) */}
                <div className="absolute top-[138px] left-[16.6%] right-0 border-t-2 border-red-500 z-10 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                </div>

                {timeSlots.map((time, idx) => (
                  <div key={time} className="grid grid-cols-6 min-h-[64px] relative">
                    <div className="p-2 text-slate-400 text-[10px] font-semibold text-right border-r border-slate-100 select-none">
                      {time}
                    </div>
                    {/* 5 Cột tương ứng 5 ngày */}
                    {[0, 1, 2, 3, 4].map((col) => (
                      <div
                        key={col}
                        className="border-r border-slate-100 last:border-r-0 p-1 relative hover:bg-slate-50/50 transition"
                      >
                        {/* Buffer nghỉ trưa */}
                        {time === "11:00 AM" && (
                          <div className="absolute inset-x-1 inset-y-1 bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center text-[9px] text-slate-400 italic">
                            Lunch Buffer
                          </div>
                        )}

                        {/* Thẻ phỏng vấn: Harriet Lawrence (Thứ 2 - 10:00 AM) */}
                        {col === 0 && time === "10:00 AM" && (
                          <div className="absolute inset-x-1 top-1 bg-white border border-emerald-300 rounded-lg p-1.5 shadow-sm z-10 border-l-4 border-l-emerald-500">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                                ● Confirmed
                              </span>
                              <span className="text-[10px] text-slate-400">📹</span>
                            </div>
                            <div className="font-bold text-slate-900 text-[11px] truncate mt-0.5">
                              Harriet Lawrence
                            </div>
                            <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>R2 • Architecture</span>
                              <span className="px-1 bg-blue-100 text-blue-700 rounded text-[8px] font-bold">AJ/MB</span>
                            </div>
                          </div>
                        )}

                        {/* Thẻ gợi ý: AI Recommended (Thứ 4 - 10:00 AM) */}
                        {col === 3 && time === "10:00 AM" && (
                          <div className="absolute inset-x-1 top-1 bg-blue-50/60 border border-dashed border-blue-300 rounded-lg p-1.5 z-10 text-center">
                            <span className="text-[9px] font-bold text-blue-700 block">
                              ✨ AI Recommended ⓘ
                            </span>
                            <span className="text-[10px] font-semibold text-slate-700 block mt-0.5">
                              Free Slot B
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              All 3 panelists free
                            </span>
                          </div>
                        )}

                        {/* Thẻ phỏng vấn: Elena Rostova (Thứ 3 - 11:00 AM) */}
                        {col === 2 && time === "11:00 AM" && (
                          <div className="absolute inset-x-1 top-0 bg-white border border-amber-300 rounded-lg p-1.5 shadow-sm z-10 border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-amber-700">
                                ⌛ Awaiting Candidate
                              </span>
                              <span className="text-[10px]">✉️️</span>
                            </div>
                            <div className="font-bold text-slate-900 text-[11px] truncate mt-0.5">
                              Elena Rostova
                            </div>
                            <div className="text-[9px] text-slate-500">
                              Staff Frontend • R1
                            </div>
                          </div>
                        )}

                        {/* Thẻ phỏng vấn: David Chen (Thứ 2 - 12:30 PM) */}
                        {col === 1 && time === "12:00 PM" && (
                          <div className="absolute inset-x-1 top-4 bg-white border border-blue-300 rounded-lg p-1.5 shadow-sm z-10 border-l-4 border-l-blue-600">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-blue-700">
                                ● In Prep / Next
                              </span>
                              <span className="text-[10px]">‹›</span>
                            </div>
                            <div className="font-bold text-slate-900 text-[11px] truncate mt-0.5">
                              David Chen
                            </div>
                            <div className="text-[9px] text-slate-500 flex items-center gap-1">
                              <span>Sr Backend • R2</span>
                              <span className="px-1 bg-blue-100 text-blue-700 rounded text-[8px] font-bold">MB</span>
                            </div>
                          </div>
                        )}

                        {/* Thẻ phỏng vấn: Slot Reserved (Thứ 4 - 01:00 PM) */}
                        {col === 3 && time === "01:00 PM" && (
                          <div className="absolute inset-x-1 top-1 bg-white border border-blue-300 rounded-lg p-1.5 shadow-sm z-10 border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-blue-700">
                                ● Slot Reserved
                              </span>
                              <span className="text-[9px] text-emerald-600 font-bold">✓</span>
                            </div>
                            <div className="font-bold text-slate-900 text-[11px] truncate mt-0.5">
                              Harriet Lawrence
                            </div>
                            <div className="text-[9px] text-slate-500 flex items-center gap-1">
                              <span>R3 • Exec Review</span>
                              <span className="px-1 bg-purple-100 text-purple-700 rounded text-[8px] font-bold">SL/AJ</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Cột Bên Phải (4/12) - Quick Schedule & Panel Load */}
            <div className="col-span-4 space-y-4">
              {/* Quick Schedule & Panel Booking Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    📅 Quick Schedule &amp; Panel Booking
                  </h2>
                  <span className="text-blue-600 font-bold text-[10px] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    Smart Assist
                  </span>
                </div>

                {/* Candidate Selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    CANDIDATE &amp; MATCH PROFILE
                  </label>
                  <select
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option>Harriet Lawrence (92% AI Match • Lead UX)</option>
                    <option>David Chen (88% AI Match • Sr Backend)</option>
                    <option>Elena Rostova (84% AI Match • Staff Frontend)</option>
                  </select>
                </div>

                {/* Format Toggle Buttons */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    FORMAT
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-center">
                    {["Google Meet", "In-Person", "Async Video"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`py-1 rounded-md transition ${
                          selectedFormat === fmt
                            ? "bg-white text-blue-700 shadow-sm font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assigned Interview Panel */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    ASSIGNED INTERVIEW PANEL
                  </label>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-1.5 bg-slate-50/70 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold text-xs">✓</span>
                        <div>
                          <span className="font-bold text-slate-800 text-xs">Alex Johnson</span>
                          <span className="text-slate-400 text-[10px] ml-1">Lead</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">Free All Week</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-slate-50/70 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold text-xs">✓</span>
                        <div>
                          <span className="font-bold text-slate-800 text-xs">Marcus Broadus</span>
                          <span className="text-slate-400 text-[10px] ml-1">Architect</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-600">Free @ 2:00 PM</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-slate-50/70 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                        <div>
                          <span className="font-bold text-slate-800 text-xs">Sarah Lin</span>
                          <span className="text-slate-400 text-[10px] ml-1">VP Product</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">Tentative (Busy)</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ✨ RECOMMENDED TIME SLOTS
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold">Fatigue Optimized</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="p-2 border border-blue-200 bg-blue-50/40 rounded-lg space-y-0.5 cursor-pointer hover:bg-blue-50">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs">
                          Slot A: Thu, Oct 05 • 03:30 - 04:30 PM
                        </span>
                        <span className="text-emerald-600 font-bold text-[10px]">100% Free</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Zero schedule conflict for Harriet, Alex &amp; Marcus. Optimal fatigue score.
                      </p>
                    </div>

                    <div className="p-2 border border-slate-200 bg-white rounded-lg space-y-0.5 cursor-pointer hover:bg-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs">
                          Slot B: Fri, Oct 06 • 10:00 - 11:00 AM
                        </span>
                        <span className="text-blue-600 font-bold text-[10px]">95% Fit</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Matches candidate morning preference; Sarah Lin has 15m gap prior.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meeting Link Preview */}
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                  <span className="text-slate-600 flex items-center gap-1.5 font-mono truncate">
                    📹 meet.google.com/smr-harr-2026
                  </span>
                  <button className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                    📋
                  </button>
                </div>

                {/* Action CTA Button */}
                <button
                  type="button"
                  onClick={() => alert("Invite Sent!")}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                >
                  <span>✈️</span> Send Invite &amp; Candidate Self-Schedule Link
                </button>
              </div>

              {/* Panel Load & Health Balance Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    ⚖️ Panel Load &amp; Health Balance
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Workload balancing prevents interviewer burnout and enforces equitable panel participation.
                </p>

                {/* Progress Bars */}
                <div className="space-y-2.5 text-[10px]">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                      <span>Alex Johnson (Lead)</span>
                      <span className="font-bold text-slate-900">6.5h / 8.0h cap (81%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full w-[81%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                      <span>Marcus Broadus (Senior Dev)</span>
                      <span className="font-bold text-slate-900">4.0h / 6.0h cap (67%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[67%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                      <span>Sarah Lin (VP Product)</span>
                      <span className="font-bold text-slate-900">2.0h / 4.0h cap (50%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full w-[50%]" />
                    </div>
                  </div>
                </div>

                {/* Fatigue Guardrail Active Note */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2">
                  <span className="text-emerald-600 text-xs font-bold mt-0.5">🛡️</span>
                  <div>
                    <span className="font-bold text-slate-900 text-[10px] block">
                      Fatigue Guardrail Active
                    </span>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Panelists will not receive more than 2 consecutive technical rounds without a 45m cooldown.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Đồng Bộ Hóa */}
        <footer className="h-9 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            Calendar synchronization synced 2 mins ago with Google Workspace Calendar API.
          </span>
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <button className="hover:text-blue-600 uppercase">Download .ICS</button>
            <span>•</span>
            <button className="hover:text-blue-600 uppercase">Printer View</button>
          </div>
        </footer>
    </div>
  );
}