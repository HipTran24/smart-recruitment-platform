import React, { useState } from "react";

export default function ApplicationDetailDossier() {
  const [activeTab, setActiveTab] = useState("Extracted Dossier & Skill Matrix");
  const [verifiedInference, setVerifiedInference] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-w-0 font-sans antialiased text-xs">
        {/* Top Navbar */}
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>Workspace</span>
            <span>/</span>
            <span>Candidates</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Harriet Lawrence</span>
            <span className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search applicant dossiers, skills, notes... ⌘K"
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
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              AJ
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 max-w-[1400px] w-full mx-auto space-y-4">
          {/* Sub Header Navigation & Quick Meta */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Candidates Matrix
              </button>
              <span>•</span>
              <span className="font-semibold text-slate-700">#REQ-2026-084 : Lead UX Researcher</span>
              <span className="px-1.5 py-0.2 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                ● Active Requisition
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 flex items-center gap-1">
                <span>+</span> Post New Job
              </button>
              <span>Applicant ID: <strong className="text-slate-700">#APP-884920</strong></span>
              <span>•</span>
              <span>Assigned: <strong className="text-slate-700">Alex Johnson</strong></span>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg">
                  HL
                </div>
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 flex items-center justify-center text-white text-[8px]">
                  ✓
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">Harriet Lawrence</h1>
                  <span className="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 font-bold text-[10px]">
                    ⚡ 92% AI Match <span className="font-normal text-slate-400">Alg v1.4</span>
                  </span>
                  <span className="px-2 py-0.5 rounded border border-blue-100 bg-blue-50/70 text-blue-600 font-semibold text-[10px]">
                    ● Interview Stage
                  </span>
                </div>
                <p className="text-slate-600 font-medium">
                  Lead UX Researcher <span className="text-slate-400 font-normal">• Applied Sep 24, 2026 via LinkedIn Recruiter Inbound</span>
                </p>
                <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-0.5">
                  <span className="flex items-center gap-1">✉ harriet.lawrence@uxstudio.io</span>
                  <span>•</span>
                  <span>☎ +1 (555) 382-1049</span>
                  <span>•</span>
                  <span>📍 San Francisco, CA (Remote Friendly)</span>
                  <span>•</span>
                  <a href="#" className="text-blue-600 hover:underline">🔗 LinkedIn</a>
                  <span>•</span>
                  <a href="#" className="text-blue-600 hover:underline">🌐 Portfolio (uxstudio.io)</a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold flex items-center gap-1.5">
                  📅 Schedule Interview
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold flex items-center gap-1.5">
                  📄 Raw CV (PDF)
                </button>
                <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5">
                  ✓ Approve & Move Next
                </button>
              </div>
              <button className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold pr-1">
                ✕ Decline
              </button>
            </div>
          </div>

          {/* Stepper Pipeline Lifecycle */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                📈 Recruitment Pipeline Lifecycle
              </span>
              <span className="text-slate-400 text-[10px]">
                ⚡ Gemini 2.5 Flash structured parse • Schema: <strong className="text-slate-600">cv-extraction-v1</strong> • Confidence: 94%
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-1 text-[10px]">
              <div className="border border-slate-200 bg-slate-50/70 rounded p-1.5">
                <div className="flex justify-between font-bold text-slate-700">STEP 1 <span>✓</span></div>
                <div className="font-semibold text-slate-900 mt-0.5">Applied</div>
                <div className="text-slate-400">Sep 24 • LinkedIn</div>
              </div>

              <div className="border border-slate-200 bg-slate-50/70 rounded p-1.5">
                <div className="flex justify-between font-bold text-slate-700">STEP 2 <span>✓</span></div>
                <div className="font-semibold text-slate-900 mt-0.5">CV Parsed</div>
                <div className="text-slate-400">1.4s • Gemini Flash</div>
              </div>

              <div className="border border-slate-200 bg-slate-50/70 rounded p-1.5">
                <div className="flex justify-between font-bold text-slate-700">STEP 3 <span>✓</span></div>
                <div className="font-semibold text-slate-900 mt-0.5">AI Screened</div>
                <div className="text-blue-600 font-bold">92% Match Met</div>
              </div>

              <div className="border border-blue-600 bg-blue-600 text-white rounded p-1.5 shadow-sm">
                <div className="flex justify-between font-bold text-blue-200">STEP 4 • CURRENT <span>●</span></div>
                <div className="font-bold text-white mt-0.5">Interviewing</div>
                <div className="text-blue-100">In Progress</div>
              </div>

              <div className="border border-slate-200 bg-white rounded p-1.5 opacity-60">
                <div className="flex justify-between font-bold text-slate-500">STEP 5 <span>○</span></div>
                <div className="font-semibold text-slate-700 mt-0.5">Panel Review</div>
                <div className="text-slate-400">3 Evaluators</div>
              </div>

              <div className="border border-slate-200 bg-white rounded p-1.5 opacity-60">
                <div className="flex justify-between font-bold text-slate-500">STEP 6 <span>○</span></div>
                <div className="font-semibold text-slate-700 mt-0.5">Final Offer</div>
                <div className="text-slate-400">Pending Decision</div>
              </div>
            </div>
          </div>

          {/* Alert: Needs Recruiter Verification */}
          {!verifiedInference && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Needs Recruiter Verification (1 Skill Inference)</span>
                    <span className="px-1.5 py-0.2 bg-amber-100 border border-amber-200 text-amber-800 rounded text-[9px] font-bold">
                      Human-in-the-Loop
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    1 skill inference (<strong>"Design Systems Governance"</strong>) was derived indirectly from portfolio deliverables and token handoff docs. Recruiter verification is recommended before scorecard finalization.
                  </p>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    schema: cv-extraction-v1 • inference latency: 1.4s • confidence: 94.2%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setVerifiedInference(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md flex items-center gap-1 shadow-sm"
                >
                  ✓ Verify Met
                </button>
                <button
                  onClick={() => setVerifiedInference(true)}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-md"
                >
                  ✕ Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs trong Dossier */}
          <div className="border-b border-slate-200 flex items-center gap-6 text-slate-500 font-semibold text-xs">
            {[
              "Extracted Dossier & Skill Matrix",
              "Career Trajectory & Experience",
              "Education & Accreditations",
              "Raw CV Text & Original PDF",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid Nội dung chính & Bảng điểm Match bên phải */}
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* Cột Trái (8/12) */}
            <div className="col-span-8 space-y-4">
              {/* Box 1: Core Competencies & Evidence Triangulation */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <h2 className="font-bold text-slate-900 text-xs">Core Competencies & Evidence Triangulation</h2>
                    <p className="text-slate-400 text-[10px]">4 Requisition Requirements • 3 Optional Nice-to-Have Factors</p>
                  </div>
                  <span className="text-blue-600 font-semibold text-[10px] flex items-center gap-1">
                    ⚡ Structured Match Engine
                  </span>
                </div>

                {/* Item 1 */}
                <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs">User Testing & Lab Studies</span>
                      <span className="px-1.5 py-0.2 bg-slate-200/70 text-slate-600 rounded text-[9px] font-semibold">Core Required</span>
                    </div>
                    <span className="text-emerald-600 font-bold text-[10px]">● 100% Match</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-emerald-700">✓ Empirical Evidence:</strong> 6+ years verified hands-on usability lab leadership across B2B enterprise suites (FinTech Scaleup Inc., SaaS Cloud Corp).
                  </p>
                </div>

                {/* Item 2 */}
                <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs">Figma & Advanced Prototyping</span>
                      <span className="px-1.5 py-0.2 bg-slate-200/70 text-slate-600 rounded text-[9px] font-semibold">Core Required</span>
                    </div>
                    <span className="text-emerald-600 font-bold text-[10px]">● 100% Match</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-emerald-700">✓ Empirical Evidence:</strong> 7+ years continuous active stack, design tokens, variables, interactive component state matrices, and design system governance.
                  </p>
                </div>

                {/* Item 3 */}
                <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs">Usability Benchmarking & Quantitative Metrics</span>
                      <span className="px-1.5 py-0.2 bg-slate-200/70 text-slate-600 rounded text-[9px] font-semibold">Core Required</span>
                    </div>
                    <span className="text-emerald-600 font-bold text-[10px]">● 96% Match</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-emerald-700">✓ Empirical Evidence:</strong> Authored standardized SUS / SUPR-Q frameworks; integrated telemetry dashboards with Mixpanel & FullStory cohorts.
                  </p>
                </div>

                {/* Item 4 */}
                <div className="border border-amber-200 rounded-lg p-2.5 bg-amber-50/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs">Design Systems Governance</span>
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-semibold">Core Required</span>
                    </div>
                    <span className="text-amber-600 font-bold text-[10px]">⚠ Needs Review</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-amber-700">⚠ Inferred Context:</strong> Inferred from cross-squad token handoff workflows in candidate portfolio case studies. Direct CV mention is brief.
                  </p>
                </div>

                {/* Secondary Skills Tags */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Secondary & Complementary Competencies (Extracted)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Wireframing & Info Architecture (100%)", "Design Sprints (GV Methodology) (100%)", "Quant Surveys (Qualtrics / UserZoom) (98%)"].map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Career Trajectory & Validated Experience */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <h2 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  Career Trajectory & Validated Experience
                </h2>

                <div className="space-y-3 pl-2">
                  {/* Job 1 */}
                  <div className="border-l-2 border-blue-600 pl-3 space-y-1 relative">
                    <span className="w-2 h-2 rounded-full bg-blue-600 absolute -left-[5px] top-1" />
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-xs">
                        Senior UX Researcher • <span className="text-blue-600 underline">FinTech Scaleup Inc.</span>
                      </h3>
                      <span className="text-slate-400 text-[10px]">2022 – Present • 3 yrs 2 mos</span>
                    </div>
                    <p className="text-emerald-700 text-[10px] font-semibold">✓ Verified via LinkedIn Inbound & Prior Work References</p>
                    <ul className="list-disc pl-3 text-slate-600 text-[11px] space-y-0.5">
                      <li>Spearheaded customer intelligence operations across core multi-tenant B2B enterprise platform serving 40k daily users.</li>
                      <li>Scaled unmoderated testing cohort panel by 300% and lowered checkout workflow friction index by 24bps across pilot accounts.</li>
                      <li>Established research ops standard operating procedures, repository taxonomies, and cross-functional synthesis cadences.</li>
                    </ul>
                  </div>

                  {/* Job 2 */}
                  <div className="border-l-2 border-slate-300 pl-3 space-y-1 relative">
                    <span className="w-2 h-2 rounded-full bg-slate-300 absolute -left-[5px] top-1" />
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-xs">
                        Product Design Researcher • <span className="text-slate-700">SaaS Cloud Corp</span>
                      </h3>
                      <span className="text-slate-400 text-[10px]">2019 – 2022 • 3 yrs</span>
                    </div>
                    <ul className="list-disc pl-3 text-slate-600 text-[11px] space-y-0.5">
                      <li>Collaborated directly alongside 4 dedicated squad product managers to build foundational user journey maps, card sorting baselines, and usability benchmarking programs.</li>
                      <li>Conducted 120+ deep-dive qualitative interviews with enterprise CIOs and security administrators to validate cloud migration flows.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Box 3: Education & Accreditations */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <h2 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  Education & Accreditations
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                      🎓 M.S. Human-Computer Interaction
                    </div>
                    <p className="text-slate-600 text-[11px]">University of Washington</p>
                    <p className="text-slate-400 text-[10px]">Class of 2019 • Honors Thesis in Quantitative Usability</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                      🎓 B.A. Cognitive Science
                    </div>
                    <p className="text-slate-600 text-[11px]">University of California, Berkeley</p>
                    <p className="text-slate-400 text-[10px]">Class of 2017 • Emphasis on Computational Cognition</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột Phải (4/12) */}
            <div className="col-span-4 space-y-4">
              {/* Deterministic Fit Matrix */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                  <div>
                    <h2 className="font-bold text-slate-900 text-xs">Deterministic Fit Matrix</h2>
                    <p className="text-slate-400 text-[10px]">Weighted algorithmic rubric</p>
                  </div>
                  <span className="text-blue-600 font-bold text-[10px]">📊</span>
                </div>

                {/* Score Chart Badge */}
                <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated Fit Index</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-blue-700">92</span>
                      <span className="text-xs text-slate-500 font-semibold">/100</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">↗ +14% vs candidate cohort median</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-xs text-blue-700 bg-white shadow-inner">
                    92%
                  </div>
                </div>

                {/* Metric Bars */}
                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                      <span>Required Core Skills (40% wt)</span>
                      <span className="text-blue-600 font-bold">96%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full w-[96%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                      <span>Relevant Experience (30% wt)</span>
                      <span className="text-blue-600 font-bold">90%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full w-[90%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                      <span>Optional Skills & Tools (20% wt)</span>
                      <span className="text-blue-600 font-bold">88%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full w-[88%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                      <span>Education & Domain (10% wt)</span>
                      <span className="text-emerald-600 font-bold">95%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight pt-1">
                  Score determined via deterministic algorithm v1.4. In compliance with governance policies, SmartRecruit enforces human validation before candidate pipeline progression.
                </p>
              </div>

              {/* Recruiter Scorecard Note */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h2 className="font-bold text-slate-900 text-xs">Recruiter Scorecard Note</h2>
                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[9px] font-semibold">Internal Note</span>
                </div>
                <p className="text-slate-600 text-[11px] italic bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed">
                  "Exceptional depth in quantitative testing for complex enterprise flows. Clear, crisp articulation of usability benchmarks. Recommending for direct technical panel round with Marcus & Alex."
                </p>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="font-semibold text-slate-600">Alex Johnson (Lead Recruiter)</span>
                  <span>Today, 10:14 AM</span>
                </div>
              </div>

              {/* Interview Panel */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h2 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    👥 Interview Panel
                  </h2>
                  <button className="text-blue-600 font-semibold text-[10px] hover:underline">+ Add Member</button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[9px]">AJ</div>
                      <div>
                        <p className="font-semibold text-slate-800 text-[11px] leading-none">Alex Johnson</p>
                        <p className="text-[9px] text-slate-400">Hiring Lead / Recruiter</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">● Confirmed</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[9px]">MB</div>
                      <div>
                        <p className="font-semibold text-slate-800 text-[11px] leading-none">Marcus Broadus</p>
                        <p className="text-[9px] text-slate-400">Lead Backend / Tech Panel</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-600 font-semibold">● Invited</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[9px]">SL</div>
                      <div>
                        <p className="font-semibold text-slate-800 text-[11px] leading-none">Sarah Lin</p>
                        <p className="text-[9px] text-slate-400">VP of Product</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">● Pending Avail</span>
                  </div>
                </div>
              </div>

              {/* Extraction Audit Trail */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                <h2 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5">
                  Extraction Audit Trail
                </h2>
                <div className="space-y-2 text-[10px] text-slate-500 pl-1 border-l-2 border-slate-200">
                  <div className="pl-2">
                    <p className="font-semibold text-slate-700">● Recruiter Verified Note Logged</p>
                    <p className="text-slate-400">10:14 AM by Alex Johnson</p>
                  </div>
                  <div className="pl-2">
                    <p className="font-semibold text-slate-700">● Structured CV Ingestion Completed</p>
                    <p className="text-slate-400">09:30 AM • traceId: <strong className="text-slate-600">#tr-94012</strong></p>
                  </div>
                  <div className="pl-2">
                    <p className="font-semibold text-slate-700">● Application Received</p>
                    <p className="text-slate-400">Sep 24, 2026 via LinkedIn Recruiter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Floating/Sticky Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">Application in Active Review</span>
              <span className="text-slate-400">— Assigned Requisition: <strong className="text-slate-700">Lead UX Researcher (REQ-2026-084)</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition">
                Request Candidate Info
              </button>
              <button className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-md transition">
                Decline Dossier
              </button>
              <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition flex items-center gap-1">
                Advance to Interview Panel ➔
              </button>
            </div>
          </div>
        </main>
    </div>
  );
}