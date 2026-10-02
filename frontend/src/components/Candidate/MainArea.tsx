import { Link } from "react-router-dom";
import { CandidateSearchInput } from "@/components/Candidate/CandidateSearchInput";

export const MainArea = () => {
  return (
    <div className="main-area flex-1 flex flex-col bg-slate-50 min-h-screen">
      <header className="candidate-header header">
        <div className="navbar flex items-center gap-2 text-sm text-slate-500">
          <span className="text-wrapper-3">Workspace</span>
          <span className="text-wrapper-3">/</span>
          <span className="text-wrapper-3">Candidate</span>
          <span className="text-wrapper-3">/</span>
          <span className="text-wrapper-4 font-semibold text-slate-900">
            My Applications
          </span>
        </div>
        <div className="header-actions flex items-center gap-4">
          <CandidateSearchInput />
          <div className="live-sync flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
            <div className="div-3 w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-wrapper-6">Live Sync</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content p-8 flex flex-col gap-8">
        <div className="div-4 flex justify-between items-center">
          <div className="title-area">
            <h1 className="text-wrapper-7 text-2xl font-bold text-slate-900">
              Welcome back, Harriet
            </h1>
            <p className="p text-sm text-slate-500 mt-1">
              Track applications, upcoming interviews, and explore open jobs
            </p>
          </div>
          <div className="primary-CTA flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer hover:bg-blue-700">
            <div className="plus-wrapper">
              <div className="plus"></div>
            </div>
            <span className="text-wrapper-8">Explore Jobs</span>
          </div>
        </div>

        {/* KPI Row */}
        <div className="kpi-row grid grid-cols-4 gap-6">
          <div className="kpi-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="div-4 flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider">
              <span className="text-wrapper-9">ACTIVE APPLICATIONS</span>
              <div className="state-indicator w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div className="div mt-4">
              <div className="text-wrapper-10 text-3xl font-bold text-slate-900">
                4
              </div>
              <div className="text-wrapper-11 text-xs text-slate-500 mt-1">
                in progress
              </div>
            </div>
          </div>
          <div className="kpi-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="div-4 flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider">
              <span className="text-wrapper-9">INTERVIEWS</span>
              <div className="state-indicator-2 w-2 h-2 rounded-full bg-amber-500"></div>
            </div>
            <div className="div mt-4">
              <div className="text-wrapper-10 text-3xl font-bold text-slate-900">
                1
              </div>
              <div className="text-wrapper-11 text-xs text-slate-500 mt-1">
                this week
              </div>
            </div>
          </div>
          <div className="kpi-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="div-4 flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider">
              <span className="text-wrapper-9">OFFERS RECEIVED</span>
              <div className="state-indicator-3 w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div className="div mt-4">
              <div className="text-wrapper-10 text-3xl font-bold text-slate-900">
                1
              </div>
              <div className="text-wrapper-11 text-xs text-slate-500 mt-1">
                action required
              </div>
            </div>
          </div>
          <div className="kpi-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="div-4 flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider">
              <span className="text-wrapper-9">RESUME READINESS</span>
              <div className="state-indicator-3 w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div className="div mt-4">
              <div className="text-wrapper-10 text-3xl font-bold text-slate-900">
                100%
              </div>
              <div className="text-wrapper-11 text-xs text-slate-500 mt-1">
                AI-verified
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Split */}
        <div className="main-grid-split grid grid-cols-3 gap-6">
          <div className="left-grid-column col-span-2 flex flex-col gap-6">
            {/* Progress Tracker */}
            <div className="progress-tracker bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="div">
                <div className="text-wrapper-12 font-bold text-slate-900 text-base">
                  Application Progress Tracker
                </div>
                <p className="role-lead-UX text-sm text-slate-500 mt-1">
                  <span className="span font-medium text-slate-700">
                    Role:{" "}
                  </span>
                  <span className="text-wrapper-13 text-blue-600 font-semibold">
                    Lead UX Researcher
                  </span>
                  <span className="span"> • Design Department</span>
                </p>
              </div>
              <div className="timeline-stepper flex items-center justify-between mt-6 px-4">
                <div className="step flex items-center gap-2">
                  <div className="step-indicator-group flex items-center gap-2">
                    <div className="check-indicator">
                      <div className="check-wrapper">
                        <div className="check"></div>
                      </div>
                    </div>
                    <div className="text-wrapper-14 text-xs font-medium">
                      Submitted
                    </div>
                  </div>
                  <div className="line"></div>
                </div>
                <div className="step flex items-center gap-2">
                  <div className="step-indicator-group flex items-center gap-2">
                    <div className="check-indicator">
                      <div className="check-wrapper">
                        <div className="check"></div>
                      </div>
                    </div>
                    <div className="text-wrapper-14 text-xs font-medium">
                      AI-Screened
                    </div>
                  </div>
                  <div className="line"></div>
                </div>
                <div className="step flex items-center gap-2">
                  <div className="step-indicator-group flex items-center gap-2">
                    <div className="check-indicator">
                      <div className="check-wrapper">
                        <div className="check"></div>
                      </div>
                    </div>
                    <div className="text-wrapper-14 text-xs font-medium">
                      In Review
                    </div>
                  </div>
                  <div className="line"></div>
                </div>
                <div className="step flex items-center gap-2">
                  <div className="step-indicator-group flex items-center gap-2">
                    <div className="active-dot-indicator">
                      <div className="ellipse"></div>
                    </div>
                    <div className="text-wrapper-15 text-xs font-semibold text-blue-600">
                      Interview
                    </div>
                  </div>
                  <div className="line-2"></div>
                </div>
                <div className="step-indicator-group-wrapper">
                  <div className="step-indicator-group flex items-center gap-2">
                    <div className="pending-indicator"></div>
                    <div className="text-wrapper-14 text-xs text-slate-400">
                      Decision
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="applications-table bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-wrapper-16 font-bold text-slate-900 text-base mb-4">
                My Submitted Applications
              </div>
              <div className="table w-full text-left text-sm">
                <div className="table-header grid grid-cols-5 text-xs font-semibold text-slate-400 uppercase pb-3 border-b border-slate-100">
                  <div className="text-wrapper-17">Role / Position</div>
                  <div className="text-wrapper-18">Department</div>
                  <div className="text-wrapper-19">Applied Date</div>
                  <div className="text-wrapper-20">Status</div>
                  <div className="text-wrapper-21 text-right">Action</div>
                </div>

                <div className="table-row grid grid-cols-5 items-center py-4 border-b border-slate-50 text-slate-700">
                  <div className="text-wrapper-22 font-medium text-slate-900">
                    Lead UX Researcher
                  </div>
                  <div className="text-wrapper-23 text-slate-500">Design</div>
                  <div className="text-wrapper-24 text-slate-500">Sep 18</div>
                  <div className="badge-cell">
                    <div className="frame inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                      <div className="ellipse-2 w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <div className="text-wrapper-25">Interview Scheduled</div>
                    </div>
                  </div>
                  <div className="action-cell text-right">
                    <Link
                      to="/views_details"
                      className="frame-2 inline-block px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="table-row grid grid-cols-5 items-center py-4 border-b border-slate-50 text-slate-700">
                  <div className="text-wrapper-22 font-medium text-slate-900">
                    Senior Product Designer
                  </div>
                  <div className="text-wrapper-23 text-slate-500">Design</div>
                  <div className="text-wrapper-24 text-slate-500">Sep 10</div>
                  <div className="badge-cell">
                    <div className="frame-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      <div className="div-3 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <div className="text-wrapper-27">Offer Extended</div>
                    </div>
                  </div>
                  <div className="action-cell text-right">
                    <Link
                      to="/offers/senior-product-designer/review"
                      className="div-wrapper-2 inline-block px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700"
                    >
                      <span className="text-wrapper-28">Review Offer</span>
                    </Link>
                  </div>
                </div>

                <div className="table-row-2 grid grid-cols-5 items-center py-4 text-slate-700">
                  <div className="text-wrapper-22 font-medium text-slate-900">
                    UX Strategist
                  </div>
                  <div className="text-wrapper-23 text-slate-500">
                    Core Team
                  </div>
                  <div className="text-wrapper-24 text-slate-500">Sep 15</div>
                  <div className="badge-cell">
                    <div className="frame-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <div className="ellipse-3 w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      <div className="text-wrapper-29">In Review</div>
                    </div>
                  </div>
                  <div className="action-cell text-right">
                    <Link
                      to="/views_details"
                      className="frame-2 inline-block px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Communications Panel */}
          <div className="communications-panel bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="text-wrapper-16 font-bold text-slate-900 text-base">
              Communications &amp; Action Items
            </div>
            <div className="action-items-list flex flex-col gap-3">
              <div className="action-item p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-3">
                <div className="border-tag"></div>
                <div className="text-content">
                  <p className="text-wrapper-30 text-sm font-medium text-slate-900">
                    Interview Invitation: Lead UX (Thu, 10:00 AM)
                  </p>
                  <div className="text-wrapper-31 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded w-fit mt-1">
                    Action Required
                  </div>
                </div>
                <div className="div-wrapper-2 text-right">
                  <div className="text-wrapper-32 inline-block px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
                    Join Call
                  </div>
                </div>
              </div>

              <div className="action-item p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-3">
                <div className="border-tag-2"></div>
                <div className="text-content">
                  <div className="text-wrapper-30 text-sm font-medium text-slate-900">
                    Official Offer Letter Received
                  </div>
                  <div className="text-wrapper-31 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit mt-1">
                    Action Required
                  </div>
                </div>
                <div className="div-wrapper-2 text-right">
                  <Link
                    to="/offers/senior-product-designer/review"
                    className="text-wrapper-32 inline-block px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Review Offer
                  </Link>
                </div>
              </div>

              <div className="action-item-2 p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-3">
                <div className="border-tag-3"></div>
                <div className="text-content-2">
                  <p className="text-wrapper-30 text-sm font-medium text-slate-900">
                    Resume Vault: 14 skills synced
                  </p>
                  <div className="text-wrapper-33 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded w-fit mt-1">
                    Action Required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
