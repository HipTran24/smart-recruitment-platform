import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, aiMatchBadge } from "@/components/ui/StatusBadge";

export const MyApplication = () => {
  const [activeCallModal, setActiveCallModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const steps = [
    { label: "Submitted", status: "completed", date: "Sep 18, 2026", desc: "Application received & parsed" },
    { label: "AI Screened", status: "completed", date: "Sep 19, 2026", desc: "Verified 92% Match Score" },
    { label: "In Review", status: "completed", date: "Sep 22, 2026", desc: "Shortlisted by Hiring Manager" },
    { label: "Interview", status: "active", date: "Thu, 10:00 AM", desc: "Technical & Portfolio Panel" },
    { label: "Decision", status: "pending", date: "Estimated Oct 08", desc: "Offer or feedback notice" },
  ];

  const applications = [
    {
      id: "app-1",
      role: "Lead UX Researcher",
      department: "Product Design",
      appliedDate: "Sep 18, 2026",
      matchScore: 92,
      stage: "Interviewing",
      nextAction: "Panel Interview on Thursday, 10:00 AM",
      detailsUrl: "/views_details",
      actionText: "View Details",
      isPrimary: true,
    },
    {
      id: "app-2",
      role: "Senior Product Designer",
      department: "Design Systems",
      appliedDate: "Sep 10, 2026",
      matchScore: 86,
      stage: "Offer Stage",
      nextAction: "Offer Letter Ready for Signature ($155k + RSUs)",
      detailsUrl: "/offers/senior-product-designer/review",
      actionText: "Review Offer",
      isPrimary: false,
    },
    {
      id: "app-3",
      role: "UX Strategist",
      department: "Core Experience",
      appliedDate: "Sep 15, 2026",
      matchScore: 78,
      stage: "Screened",
      nextAction: "Hiring squad reviewing assessment tasks",
      detailsUrl: "/views_details",
      actionText: "View Details",
      isPrimary: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-canvas)] min-h-screen text-[var(--color-text-primary)]">
      {/* Candidate Standard Sticky Header */}
      <header className="candidate-header">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 font-medium">
          <Link to="/" className="hover:text-slate-800 transition">
            Workspace
          </Link>
          <span className="text-slate-300">/</span>
          <span>Candidate</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">My Applications</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Live Application Sync</span>
          </div>
        </div>
      </header>


      {/* Main Container */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Welcome Banner & Primary Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Inter',sans-serif]">
                Welcome back, Harriet
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hidden sm:inline-block">
                Applicant Verified
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Track your application milestones, panel interviews, and verified skill matches in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/explore-jobs">
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Explore Open Jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Urgent Action Banner (High Visibility on top) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm shadow-emerald-200">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Next Upcoming Event
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  Thu, 10:00 AM
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Technical Panel Session: Lead UX Researcher
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                With Alex Johnson (Hiring Manager) and Marcus Broadus (Engineering Lead).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm w-full sm:w-auto"
              onClick={() => setActiveCallModal(true)}
            >
              Join Video Room
            </Button>
            <Link to="/interviews-offers" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto">
                Details &amp; Reschedule
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Row (Clean SaaS metrics, readable font) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Applications</span>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">3</div>
              <div className="text-xs text-emerald-700 font-medium mt-1">● In progress across squads</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interviews Scheduled</span>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">1</div>
              <div className="text-xs text-amber-700 font-medium mt-1">● Thu, 10:00 AM (Lead UX)</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Offers Extended</span>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">1</div>
              <div className="text-xs text-emerald-700 font-medium mt-1">● Senior Product Designer</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Profile Match Health</span>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">100%</div>
              <div className="text-xs text-indigo-700 font-medium mt-1">● Verified by Gemini 2.5</div>
            </div>
          </div>
        </div>

        {/* Main Grid Split: Left 2 Cols (Progress Tracker + Table), Right 1 Col (Side cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Active Application Pipeline Tracker Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                    Featured Stage Milestone
                  </span>
                  <h2 className="font-bold text-slate-900 text-lg">
                    Lead UX Researcher • Design Squad
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                    Step 4 of 5: Active Interview
                  </span>
                </div>
              </div>

              {/* Stepper with explicit descriptions */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
                {steps.map((step, idx) => {
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";

                  return (
                    <div key={step.label} className="flex sm:flex-col items-center gap-3 sm:gap-1.5 flex-1 w-full">
                      <div className="flex items-center w-full">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                            isCompleted
                              ? "bg-emerald-600 text-white shadow-xs"
                              : isActive
                              ? "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            idx + 1
                          )}
                        </div>

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
                              ? "text-emerald-800 font-bold"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {step.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applications List Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    My Submitted Applications
                  </h2>
                  <p className="text-xs text-slate-500">Live progress tracking across hiring squads</p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  {applications.length} Active Records
                </span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 px-3">Role &amp; Team</th>
                      <th className="pb-3 px-3">Applied Date</th>
                      <th className="pb-3 px-3">AI Match</th>
                      <th className="pb-3 px-3">Current Status</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-900 text-sm">{app.role}</div>
                          <div className="text-xs text-slate-500">{app.department}</div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">
                          {app.appliedDate}
                        </td>
                        <td className="py-3.5 px-3">
                          {aiMatchBadge(app.matchScore)}
                        </td>
                        <td className="py-3.5 px-3">
                          <StatusBadge
                            variant={app.stage === "Offer Stage" ? "offer" : app.stage === "Interviewing" ? "interviewing" : "screened"}
                            label={app.stage}
                            dot
                          />
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link to={app.detailsUrl}>
                            <Button
                              variant={app.isPrimary ? "primary" : "secondary"}
                              size="sm"
                              className={app.isPrimary ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                              {app.actionText}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="sm:hidden divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="py-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{app.role}</h3>
                        <p className="text-xs text-slate-500">{app.department} • Applied {app.appliedDate}</p>
                      </div>
                      {aiMatchBadge(app.matchScore)}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge
                        variant={app.stage === "Offer Stage" ? "offer" : app.stage === "Interviewing" ? "interviewing" : "screened"}
                        label={app.stage}
                        dot
                      />
                      <Link to={app.detailsUrl}>
                        <Button
                          variant={app.isPrimary ? "primary" : "secondary"}
                          size="sm"
                          className={app.isPrimary ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        >
                          {app.actionText} ›
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Communications & Actions */}
          <div className="flex flex-col gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-base">
                  Action Items &amp; Alerts
                </h2>
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                  2 Pending
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Item 1 */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900">
                      Interview Room Access
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Lead UX Researcher panel scheduled for Thursday at 10:00 AM.
                  </p>
                  <div className="pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setActiveCallModal(true)}
                    >
                      Enter Call Room
                    </Button>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900">
                      Official Offer Extended
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Sign-off Window
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Senior Product Designer: $155,000 + 12k RSUs. Response requested within 5 days.
                  </p>
                  <div className="pt-1">
                    <Link to="/offers/senior-product-designer/review">
                      <Button variant="secondary" size="sm">
                        Review Offer Dossier →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recruiter Direct Contact Box */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Recruiter
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Alex Johnson</p>
                <p className="text-xs text-slate-400">Senior Talent Partner • SmartRecruit</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 mt-2"
                onClick={() => showToast("Direct messaging channel opened with Alex Johnson")}
              >
                Send Direct Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      <Modal
        open={activeCallModal}
        onClose={() => setActiveCallModal(false)}
        title="Live Panel Interview Room"
        description="Verify your audio and camera before connecting to the panel."
        width="max-w-md"
      >
        <div className="flex flex-col gap-4 text-sm">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
            <div><strong>Position:</strong> Lead UX Researcher (Design Squad)</div>
            <div><strong>Host:</strong> Alex Johnson (Lead Recruiter)</div>
            <div><strong>Panelists:</strong> Marcus Broadus (Dev Lead), Sarah Jenkins (VP)</div>
            <div><strong>Duration:</strong> 45 minutes • System Design &amp; Portfolio Walkthrough</div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setActiveCallModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setActiveCallModal(false);
                showToast("Connecting to secure WebRTC video room...");
              }}
            >
              Enter Video Room
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in duration-150"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
