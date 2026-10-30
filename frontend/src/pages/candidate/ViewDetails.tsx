import { useState } from "react";
import { Link } from "react-router-dom";
import { CandidateSearchInput } from "@/components/Candidate/CandidateSearchInput";

export default function ViewDetails() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("Excited about PulseStream's vision for enterprise UX architecture!");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. Header */}
      <header className="candidate-header">
        <nav className="flex min-w-0 items-center gap-2 text-xs md:text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition">Workspace</Link>
          <span className="text-slate-300">/</span>
          <Link to="/my-applications" className="hover:text-slate-800 transition">Candidate</Link>
          <span className="text-slate-300">/</span>
          <Link to="/explore-jobs" className="hover:text-slate-800 transition">Explore Jobs</Link>
          <span className="text-slate-300">/</span>
          <span className="truncate font-semibold text-slate-900">
            UX Strategist (REQ-89024)
          </span>
        </nav>

        <div className="flex items-center gap-4">
          <CandidateSearchInput className="hidden md:flex" />
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Sync
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Role Details & AI Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                    <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">REQ-89024</span>
                    <span className="text-slate-400">• Posted 3 days ago</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    UX Strategist
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    PulseStream Technologies <span className="mx-1">•</span> Enterprise Product Experience Group
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="text-emerald-700 font-extrabold text-sm">
                    78% MATCH
                  </span>
                </div>
              </div>

              {/* Badges / Metadata */}
              <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
                  📍 Remote (US / Europe)
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
                  ⏰ Full-time / Permanent
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
                  💰 $145,000 – $165,000 / yr + Equity
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
                  👥 14 Applicants
                </span>
              </div>
            </div>

            {/* AI Match Explanation Breakdown */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/40">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    AI Gemini 2.5
                  </span>
                  <h3 className="font-bold text-sm tracking-tight text-white">
                    Score Explanation &amp; Transparent Breakdown
                  </h3>
                </div>
                <span className="text-xs text-indigo-300 font-medium">Verified Profile Data</span>
              </div>
              <p className="text-xs text-indigo-100 mb-4 leading-relaxed">
                Harriet, your 6+ years leading SaaS product discovery, design sprints, and measurable customer retention initiatives match <strong className="text-white">4 of 5 core competencies</strong> required by PulseStream.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-white">UX Strategy</div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">✓ Exact match (6 yrs)</div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-white">Figma &amp; Systems</div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">✓ Advanced proficiency</div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-white">SQL Analytics</div>
                  <div className="text-[11px] text-amber-300 font-medium mt-1">⚡ Moderate overlap</div>
                </div>
              </div>
            </div>

            {/* Role Responsibilities & Requirements */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                  Role Overview
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  PulseStream Technologies is seeking a Senior UX Strategist to architect foundational user experience frameworks across our core cloud enterprise suite. In this role, you will bridge the gap between product strategy, behavioral analytics, and human-centered design systems.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
                  Key Responsibilities
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>Define holistic user experience vision, quantitative UX KPI targets, and design roadmaps.</li>
                  <li>Conduct exploratory generative research, journey mapping, and usability benchmarking.</li>
                  <li>Partner closely with Engineering and Product Operations to maintain design system consistency.</li>
                  <li>Translate complex business goals and product telemetry into clear, testable IA blueprints.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
                  Required Competencies &amp; Tools
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
                      className="bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1 rounded-full border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Fast-track Application (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm sticky top-20">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    FAST-TRACK APPLICATION
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Apply for this Position
                  </h2>
                </div>
                <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-200">
                  Pre-filled
                </span>
              </div>

              {submitted ? (
                <div className="py-8 flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Your application for <strong className="text-slate-800">UX Strategist</strong> has been received and added to your tracked applications.
                  </p>
                  <div className="pt-3 flex gap-3">
                    <Link
                      to="/my-applications"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      View in My Applications →
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Your profile information has been securely pre-filled from your candidate vault.
                  </p>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Full Name</span>
                      <span className="text-emerald-600">✓ Verified Profile</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value="Harriet Lawrence"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Email Address</span>
                      <span className="text-slate-400">Primary Contact</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value="harriet.lawrence@example.com"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Phone Number</span>
                      <span className="text-slate-400">SMS Alerts</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value="+1 (555) 234-5678"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Portfolio &amp; Case Studies</span>
                      <span className="text-slate-400">Autofilled</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value="https://harrietlawrence.design"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 font-medium cursor-not-allowed"
                    />
                  </div>

                  {/* Attached Resume */}
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Attached Resume / CV
                    </span>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                          PDF
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Harriet_Lawrence_Resume_2026.pdf
                          </p>
                          <p className="text-[11px] text-slate-400">
                            2.4 MB • ATS Parsed &amp; Validated
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/profile-resume"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>

                  {/* Optional Note */}
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1">
                      Short Note to Hiring Team (Optional)
                    </span>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Consent */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="consent"
                      defaultChecked
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="consent" className="text-xs text-slate-500 leading-tight">
                      I consent to the processing of my verified CV data for this recruitment requisition.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <span>Submit Fast-track Application →</span>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                      🔒 Encrypted ATS submission • Confirmation dispatched immediately
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
