import { useState, type SVGProps } from "react";
import { Link } from "react-router-dom";
import { CandidateSearchInput } from "@/components/Candidate/CandidateSearchInput";

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

const Calendar = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Icon>
);

const Clock = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

const Video = (props: IconProps) => (
  <Icon {...props}>
    <path d="m16 10 5-3v10l-5-3v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3Z" />
  </Icon>
);

const MapPin = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

const ShieldCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const FileCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
    <path d="M14 2v6h6M8 15l2 2 4-4" />
  </Icon>
);

export default function InterviewsOffer() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header / Top Navigation Bar */}
      <header className="candidate-header">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition">Workspace</Link>
          <span className="text-slate-300">/</span>
          <Link to="/my-applications" className="hover:text-slate-800 transition">Candidate</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">
            Interviews &amp; Offers
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <CandidateSearchInput />

          {/* Live Sync Status */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live Sync
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Page Title & Description */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Interviews &amp; Official Offers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track upcoming conversations, confirm your schedule availability, and review formal offer packages.
          </p>
        </div>

        {/* SECTION 1: UPCOMING INTERVIEWS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Upcoming Interviews
              </h2>
              <p className="text-xs text-slate-500">
                2 scheduled · Next interview in 2 days
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast("Calendar sync active with Google Calendar / Outlook")}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              <Calendar className="h-4 w-4" />
              Sync calendar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Featured Interview Card (Action Required) */}
            <div className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition ${
              isConfirmed
                ? "border-emerald-200 bg-white ring-1 ring-emerald-100"
                : "border-amber-200 bg-white ring-1 ring-amber-100"
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                      isConfirmed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      03
                    </span>
                    <span className={`text-xs font-bold tracking-wider uppercase ${
                      isConfirmed ? "text-emerald-700" : "text-amber-700"
                    }`}>
                      Technical Interview
                    </span>
                  </div>
                  {isConfirmed ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      ✓ Availability Confirmed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsConfirmed(true);
                        showToast("Availability confirmed! Notification sent to Marcus Chen.");
                      }}
                      className="rounded-full bg-amber-50 hover:bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-300 transition"
                    >
                      Confirm Availability Now
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Lead UX Researcher – Technical Round
                  </h3>
                  <p className="text-xs text-slate-500">
                    Product Design · Enterprise Experience Team
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 border-y border-slate-100 py-3 sm:grid-cols-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Fri, 25 Sep 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>10:30–11:30 AM BST</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Google Meet</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                    MC
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Marcus Chen
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Director of User Research
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast("Connecting to Google Meet room (meet.google.com/ux-lead-interview)...")}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                >
                  <Video className="h-3.5 w-3.5" />
                  Join Video Call
                </button>
              </div>
            </div>

            {/* Standard Interview Card (Confirmed) */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Portfolio Review
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                    Confirmed
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Senior Product Designer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Platform & Design Systems
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 border-y border-slate-100 py-3 sm:grid-cols-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Wed, 30 Sep</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>2:00–2:45 PM BST</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>London HQ · Room 4B</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                Bring 1–2 case studies covering systems thinking and
                cross-functional delivery.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: OFFICIAL OFFERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Official Offers
              </h2>
              <p className="text-xs text-slate-500">
                Review terms and respond before the offer expires.
              </p>
            </div>
            <span className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
              1 ACTIVE OFFER
            </span>
          </div>

          {/* Offers Table Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {/* Table Header */}
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Company / Department</th>
                    <th className="px-6 py-3.5">Offer Date</th>
                    <th className="px-6 py-3.5">Expiration Date</th>
                    <th className="px-6 py-3.5 text-right">Status & Action</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100">
                  <tr className="transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        Senior Product Designer
                      </div>
                      <div className="text-slate-400">Full-time · Hybrid</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        Northstar Labs
                      </div>
                      <div className="text-slate-400">Product Experience</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      18 Sep 2026
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        28 Sep 2026
                      </div>
                      <div className="font-medium text-amber-600">
                        3 days remaining
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                          Offer Extended
                        </span>
                        <Link
                          to="/offers/senior-product-designer/review"
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                          Review &amp; Sign
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Offer Guidance Banner */}
            <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Documents are encrypted and your signature is securely recorded
                in your candidate profile.
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
