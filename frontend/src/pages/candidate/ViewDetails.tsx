import { CandidateSearchInput } from "@/components/Candidate/CandidateSearchInput";

export default function ViewDetails() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Header phía trên */}
      <header className="candidate-header">
        <nav className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-500">
          <span className="cursor-pointer hover:text-slate-800">Workspace</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-slate-800">Candidate</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-slate-800">
            Explore Jobs
          </span>
          <span>/</span>
          <span className="truncate font-semibold text-slate-900">
            Job Details
          </span>
        </nav>

        <div className="flex items-center gap-4">
          {/* Ô tìm kiếm */}
          <CandidateSearchInput className="hidden md:flex" />

          {/* Live Sync Badge */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </div>
        </div>
      </header>

      {/* 2. Khu vực nội dung chính dạng lưới 2 cột */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: Chi tiết công việc & AI Match (8 cột) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tiêu đề & Thông tin chung */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                    <span>REQ-89024</span>
                    <span className="text-slate-400">• Posted 3 days ago</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    UX Strategist
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    PulseStream Technologies <span className="mx-1">•</span>{" "}
                    Enterprise Product Experience Group
                  </p>
                </div>

                {/* Huy hiệu Match */}
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <span className="text-emerald-700 font-bold text-sm">
                    78% MATCH
                  </span>
                </div>
              </div>

              {/* Thẻ metadata */}
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md">
                  📍 Remote (US / Europe)
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md">
                  ⏰ Full-time / Permanent
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md">
                  💰 $145,000 – $165,000 / yr + Equity
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md">
                  👥 14 Applicants
                </span>
              </div>
            </div>

            {/* AI Insight Match Breakdown */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                    AI
                  </span>
                  <h3 className="font-semibold text-sm">
                    SmartRecruit Match Breakdown & Transparency
                  </h3>
                </div>
                <span className="text-xs text-indigo-300">
                  Verified Profile Data
                </span>
              </div>
              <p className="text-xs text-indigo-100 mb-4 leading-relaxed">
                Harriet, your 6+ years leading SaaS product discovery, design
                sprints, and measurable customer retention initiatives match{" "}
                <strong className="text-white">4 of 5 core competencies</strong>{" "}
                required by PulseStream.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <div className="text-xs font-semibold">UX Strategy</div>
                  <div className="text-[11px] text-indigo-300 mt-1">
                    Exact match (6 yrs)
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <div className="text-xs font-semibold">Figma & Systems</div>
                  <div className="text-[11px] text-indigo-300 mt-1">
                    Advanced proficiency
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <div className="text-xs font-semibold">SQL Analytics</div>
                  <div className="text-[11px] text-indigo-300 mt-1">
                    Moderate overlap
                  </div>
                </div>
              </div>
            </div>

            {/* Role Overview & Responsibilities */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-2">
                  ROLE OVERVIEW
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  PulseStream Technologies is seeking a Senior UX Strategist to
                  architect foundational user experience frameworks across our
                  core cloud enterprise suite. In this role, you will bridge the
                  gap between product strategy, behavioral analytics, and
                  human-centered design systems.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-3">
                  KEY RESPONSIBILITIES
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>
                    Define holistic user experience vision, quantitative UX KPI
                    targets, and design roadmaps.
                  </li>
                  <li>
                    Conduct exploratory generative research, journey mapping,
                    and usability benchmarking.
                  </li>
                  <li>
                    Partner closely with Engineering and Product Operations to
                    maintain design system consistency.
                  </li>
                  <li>
                    Translate complex business goals and product telemetry into
                    clear, testable IA blueprints.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-3">
                  REQUIRED SKILLS & TOOLS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "UX Strategy",
                    "Figma",
                    "Analytics & UX Metrics",
                    "Information Architecture",
                    "Design Systems",
                    "User Research",
                    "WCAG AA Accessibility",
                  ].map((skill, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Form ứng tuyển nhanh (Fast-track Application) (5 cột) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider">
                    FAST-TRACK APPLICATION
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Apply for this Position
                  </h2>
                </div>
                <span className="bg-blue-50 text-blue-600 font-semibold text-xs px-2.5 py-1 rounded-full">
                  1/1
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Your profile information has been securely pre-filled from your
                candidate vault.
              </p>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Full Name</span>
                    <span className="text-emerald-600 font-semibold">
                      ✓ Verified
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value=""
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Email Address</span>
                    <span className="text-slate-400">Primary contact</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value=""
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Phone Number</span>
                    <span className="text-slate-400">SMS alerts</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value=""
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Portfolio / Work Case Studies</span>
                    <span className="text-slate-400">Autofilled</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value="https://"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Attached Resume */}
                <div className="pt-2">
                  <span className="text-xs font-medium text-slate-700 block mb-2">
                    Attached Resume / CV
                  </span>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                        PDF
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Harriet_Lawrence_Resume_2026.pdf
                        </p>
                        <p className="text-[11px] text-slate-400">
                          2.4 MB • ATS Parsed & Validated
                        </p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-blue-600 hover:underline">
                      Replace
                    </button>
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <span className="text-xs font-medium text-slate-700 block mb-1">
                    Short Note to Hiring Squad (Optional)
                  </span>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    placeholder="Excited about PulseStream's vision..."
                    defaultValue=""
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-500 leading-normal">
                    I consent to the processing of my personal data for this
                    recruitment process in accordance with privacy guidelines.
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors text-sm">
                    Submit Application →
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    🔒 Encrypted 256-bit ATS submission • Instant confirmation
                    email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
