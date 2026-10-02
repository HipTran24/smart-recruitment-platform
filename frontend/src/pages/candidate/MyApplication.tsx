import { useState } from "react";
import { Link } from "react-router-dom";
import { CandidateSearchInput } from "@/components/Candidate/CandidateSearchInput";

export const MyApplication = () => {
  const [activeCallModal, setActiveCallModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const steps = [
    { label: "Submitted", status: "completed", date: "Sep 18" },
    { label: "AI-Screened", status: "completed", date: "Sep 19 (92% Match)" },
    { label: "In Review", status: "completed", date: "Sep 22" },
    { label: "Interview", status: "active", date: "Thu, 10:00 AM" },
    { label: "Decision", status: "pending", date: "Pending" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <header className="candidate-header">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 font-medium">
          <Link to="/" className="hover:text-slate-800 transition">Workspace</Link>
          <span className="text-slate-300">/</span>
          <span>Candidate</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">My Applications</span>
        </div>
        <div className="flex items-center gap-4">
          <CandidateSearchInput className="hidden sm:flex" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Sync</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
        {/* Welcome & CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, Harriet
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your application milestones, panel interviews, and verified skill matches in real-time.
            </p>
          </div>
          <Link
            to="/explore-jobs"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Explore Open Jobs</span>
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>ACTIVE APPLICATIONS</span>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">4</div>
              <div className="text-xs text-blue-600 font-medium mt-1">● In progress across squads</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>INTERVIEWS SCHEDULED</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">1</div>
              <div className="text-xs text-amber-600 font-medium mt-1">● Thu, 10:00 AM (Lead UX)</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>OFFERS EXTENDED</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">1</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">● Senior Product Designer</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>PROFILE READINESS</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs text-indigo-600 font-medium mt-1">● Verified by Gemini 2.5</div>
            </div>
          </div>
        </div>

        {/* Main Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Progress Tracker & Applications Table */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Progress Tracker Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    Active Application Pipeline Tracker
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target Role: <span className="font-semibold text-blue-600">Lead UX Researcher</span> • Design Squad
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200/60">
                  Stage 4 of 5
                </span>
              </div>

              {/* Stepper Steps */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
                {steps.map((step, idx) => {
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";

                  return (
                    <div key={step.label} className="flex sm:flex-col items-center gap-3 sm:gap-1.5 flex-1 w-full">
                      <div className="flex items-center w-full">
                        {/* Circle Indicator */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                            isCompleted
                              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                              : isActive
                              ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            idx + 1
                          )}
                        </div>

                        {/* Connector line */}
                        {idx < steps.length - 1 && (
                          <div
                            className={`hidden sm:block flex-1 h-0.5 mx-2 rounded ${
                              isCompleted ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex flex-col sm:items-center text-left sm:text-center mt-1">
                        <span
                          className={`text-xs font-semibold ${
                            isActive
                              ? "text-blue-700"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {step.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 text-base">
                  My Submitted Applications
                </h2>
                <span className="text-xs text-slate-500 font-medium">3 active roles</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Role / Position</th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold">Applied</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pr-2">
                        <div className="font-semibold text-slate-900">Lead UX Researcher</div>
                        <div className="text-xs text-blue-600 font-medium">92% AI Match</div>
                      </td>
                      <td className="py-3.5 text-xs text-slate-600">Product Design</td>
                      <td className="py-3.5 text-xs text-slate-500">Sep 18, 2026</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Interview Scheduled
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to="/views_details"
                          className="inline-block px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pr-2">
                        <div className="font-semibold text-slate-900">Senior Product Designer</div>
                        <div className="text-xs text-emerald-600 font-medium">86% AI Match</div>
                      </td>
                      <td className="py-3.5 text-xs text-slate-600">Design Systems</td>
                      <td className="py-3.5 text-xs text-slate-500">Sep 10, 2026</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Offer Extended
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to="/offers/senior-product-designer/review"
                          className="inline-block px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                        >
                          Review Offer
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pr-2">
                        <div className="font-semibold text-slate-900">UX Strategist</div>
                        <div className="text-xs text-slate-500 font-medium">78% AI Match</div>
                      </td>
                      <td className="py-3.5 text-xs text-slate-600">Core Experience</td>
                      <td className="py-3.5 text-xs text-slate-500">Sep 15, 2026</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          In Review
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to="/views_details"
                          className="inline-block px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Col: Communications & Action Items */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-base">
                  Action Items & Alerts
                </h2>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  2 Pending
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Item 1 */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 border-l-4 border-l-amber-500 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      Technical Interview: Lead UX Researcher
                    </p>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded uppercase">
                      Action Required
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Thu, 10:00 AM • Google Meet with Alex Johnson (Lead)
                  </p>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setActiveCallModal(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Join Meeting
                    </button>
                    <Link
                      to="/interviews-offers"
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition"
                    >
                      Reschedule
                    </Link>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 border-l-4 border-l-emerald-500 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      Official Offer Letter Ready for Review
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded uppercase">
                      Sign-off Pending
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Senior Product Designer • $155,000 + 12k RSUs
                  </p>
                  <div>
                    <Link
                      to="/offers/senior-product-designer/review"
                      className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Review &amp; Sign Offer →
                    </Link>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 border-l-4 border-l-blue-500 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      Resume Vault Synchronized
                    </p>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    14 core competencies verified across your latest PDF CV.
                  </p>
                  <div>
                    <Link
                      to="/profile-resume"
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Inspect Profile &amp; Skills ›
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Recruiter Contact</span>
              </div>
              <p className="text-sm font-semibold">Alex Johnson</p>
              <p className="text-xs text-slate-400 mt-0.5">Senior Talent Partner • SmartRecruit</p>
              <button
                type="button"
                onClick={() => showToast("Message window opened: alex.johnson@smartrecruit.io")}
                className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/10 transition"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      {activeCallModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <h3 className="font-bold text-slate-900 text-base">Interview Room Active</h3>
              </div>
              <button
                onClick={() => setActiveCallModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are joining the panel session for <strong className="text-slate-900">Lead UX Researcher</strong>.
              Camera and microphone checks are enabled.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>Host:</strong> Alex Johnson (Lead Recruiter)</div>
              <div><strong>Panelists:</strong> Marcus Broadus (Dev Lead), Sarah Jenkins (VP)</div>
              <div><strong>Format:</strong> System Design &amp; Portfolio Walkthrough (45 mins)</div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveCallModal(false);
                  showToast("Connecting to secure WebRTC video room...");
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition"
              >
                Enter Video Room
              </button>
              <button
                onClick={() => setActiveCallModal(false)}
                className="py-2.5 px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
