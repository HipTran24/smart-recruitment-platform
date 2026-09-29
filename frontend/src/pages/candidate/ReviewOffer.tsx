import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const Search = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

const Bell = (props: IconProps) => (
  <Icon {...props}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
  </Icon>
);

const Clock = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

const Award = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="5" />
    <path d="m8.5 12.5-1 8 4.5-2.5 4.5 2.5-1-8" />
  </Icon>
);

const HeartPulse = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20.8 8.6A5.5 5.5 0 0 0 12 5.5a5.5 5.5 0 0 0-8.8 3.1C2 13 5 16 12 21c7-5 10-8 8.8-12.4Z" />
    <path d="M4 12h3l1.5-3 3 6 1.5-3H20" />
  </Icon>
);

const Laptop = (props: IconProps) => (
  <Icon {...props}>
    <rect x="4" y="4" width="16" height="11" rx="1" />
    <path d="M2 19h20M8 19h8" />
  </Icon>
);

const GraduationCap = (props: IconProps) => (
  <Icon {...props}>
    <path d="m3 9 9-5 9 5-9 5-9-5Z" />
    <path d="M7 11v5c3 2 7 2 10 0v-5M21 9v6" />
  </Icon>
);

const CalendarDays = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </Icon>
);

const Download = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Icon>
);

const ShieldCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const CheckCircle2 = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16 9" />
  </Icon>
);

const Edit3 = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
  </Icon>
);

const XCircle = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </Icon>
);

const Lock = (props: IconProps) => (
  <Icon {...props}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

export default function ReviewOffer() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Bar / Header */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-3.5 shadow-sm">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span>Workspace</span>
          <span>/</span>
          <span>Candidate</span>
          <span>/</span>
          <span>My Applications</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">Review Offer</span>
        </div>

        {/* Right Utilities */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search open jobs..."
              className="w-60 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-12 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
            <kbd className="absolute right-2.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              ⌘K
            </kbd>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Live Sync Status */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live Sync
          </div>

          {/* Notification Button */}
          <button className="relative rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header Banner Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">Official Job Offer</h1>
            <p className="text-xs text-indigo-200">
              Senior UX Designer • PulseStream Technologies — Enterprise Product
              Experience Group
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Offer Extended
            </span>

            <div className="flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-medium text-amber-200">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>
                Response Deadline:{" "}
                <strong className="text-white">Oct 05, 2026</strong> (4 days
                left)
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout Split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: OFFER DETAILS (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Position & Employment Terms Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-1.5 rounded-full bg-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Position & Employment Terms
                  </h2>
                </div>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-600">
                  REQ-89024
                </span>
              </div>

              {/* Spec Tiles Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Role Title
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    Senior UX Designer
                  </div>
                  <div className="text-xs text-slate-500">
                    Enterprise Cloud Suite
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Department & Team
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    Design & Product Systems
                  </div>
                  <div className="text-xs text-slate-500">
                    Core Architecture Pod
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Employment Modality
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    Full-Time / Hybrid
                  </div>
                  <div className="text-xs text-slate-500">
                    3 days onsite, 2 days remote
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Reporting Manager
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    David Vance
                  </div>
                  <div className="text-xs text-slate-500">
                    VP of Product Design
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Proposed Start Date
                  </span>
                  <div className="text-sm font-bold text-indigo-600">
                    November 02, 2026
                  </div>
                  <div className="text-xs text-slate-500">
                    Cohort Onboarding #44
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Work Location
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    San Francisco, CA
                  </div>
                  <div className="text-xs text-slate-500">
                    PulseStream Tech Center HQ
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation Package Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-1.5 rounded-full bg-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Compensation Package & Benefits Overview
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Award className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified Grade L5</span>
                </div>
              </div>

              {/* High Impact Numbers Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-4 space-y-1">
                  <div className="text-xs font-medium text-slate-500">
                    Base Annual Salary
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    $155,000
                  </div>
                  <p className="text-[11px] text-slate-400">
                    $12,916 / mo • Semi-Monthly
                  </p>
                  <div className="absolute top-0 right-0 h-12 w-12 bg-indigo-500/10 rounded-bl-full pointer-events-none" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white p-4 space-y-1">
                  <div className="text-xs font-medium text-slate-500">
                    Performance Bonus
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600">
                    15%
                  </div>
                  <p className="text-[11px] text-slate-400">
                    $23,250 / yr • Annual Review
                  </p>
                  <div className="absolute top-0 right-0 h-12 w-12 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-4 space-y-1">
                  <div className="text-xs font-medium text-slate-500">
                    Equity Option Grant
                  </div>
                  <div className="text-2xl font-extrabold text-blue-600">
                    12,000 RSUs
                  </div>
                  <p className="text-[11px] text-slate-400">
                    4-yr vesting (1-yr cliff)
                  </p>
                  <div className="absolute top-0 right-0 h-12 w-12 bg-blue-500/10 rounded-bl-full pointer-events-none" />
                </div>
              </div>

              {/* Perks Grid */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Standard PulseStream Tier-1 Perks
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50/60">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Comprehensive Health
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Premium Medical, Dental, Vision (100% employer paid
                        premium).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50/60">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Equipment Allowance
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        $2,500 Home Office Stipend + Apple M3 Max Studio
                        workstation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50/60">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Learning & Growth
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        $2,000 / yr professional development, coaching, &
                        conference travel.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50/60">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Flexible Paid Time Off
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        24 days PTO + 12 Federal holidays + 16 weeks parental
                        leave.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: OFFICIAL DOCUMENT & ACTIONS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Official Offer Letter Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100 font-bold text-xs text-red-700">
                    PDF
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      PulseStream_Offer_2026.pdf
                    </div>
                    <div className="text-[11px] text-slate-400">
                      3.4 MB • Electronically Signed
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                  Ready to Sign
                </span>
              </div>

              {/* Realistic Document Preview Box */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3 font-sans text-xs text-slate-600">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-900">
                    PulseStream Tech Inc.
                  </span>
                  <span className="text-[11px] text-slate-400">
                    September 28, 2026
                  </span>
                </div>

                <p className="font-semibold text-slate-800">
                  Dear Harriet Lawrence,
                </p>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  On behalf of PulseStream Technologies, we are thrilled to
                  offer you the full-time role of Senior UX Designer reporting
                  to David Vance...
                </p>

                {/* Document Snippet summary */}
                <div className="rounded border border-slate-200 bg-white p-2.5 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual Base:</span>
                    <strong className="text-slate-800">$155,000.00 USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RSU Allocation:</span>
                    <strong className="text-slate-800">12,000 units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Start:</span>
                    <strong className="text-slate-800">Nov 02, 2026</strong>
                  </div>
                </div>

                {/* Simulated Signature */}
                <div className="flex items-center justify-between rounded bg-emerald-50/60 border border-emerald-100 p-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold text-emerald-900">
                        Digitally Signed by HR
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Sarah Jenkins, Chief People Officer
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    SHA-256
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]">
                <Download className="h-4 w-4 text-slate-500" />
                Download Signed Offer Letter (PDF)
              </button>
            </div>

            {/* Candidate Decision & Sign-off Card */}
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/30 to-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Candidate Decision & Sign-off
                </h3>
              </div>

              {/* Advisory Callout */}
              <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Your acceptance is legally binding upon digital signature.
                  Need adjustments before signing?
                </p>
              </div>

              {/* Action Buttons Stack */}
              <div className="space-y-2.5">
                {/* Primary Accept */}
                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 px-4 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-[0.98]">
                  <CheckCircle2 className="h-4 w-4" />
                  Accept & Sign Offer
                </button>

                {/* Dual Secondary Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]">
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    Request Changes
                  </button>

                  <button className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition active:scale-[0.98]">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                    Decline Offer
                  </button>
                </div>
              </div>

              {/* Security Footer */}
              <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-slate-400">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>
                  Encrypted DocuSign integration • Candidate Portal v4.2
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
