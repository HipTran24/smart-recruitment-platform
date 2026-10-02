import { useState, type SVGProps } from "react";
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

const Save = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </Icon>
);

const UploadCloud = (props: IconProps) => (
  <Icon {...props}>
    <path d="M16 16l-4-4-4 4M12 12v9" />
    <path d="M20.4 17.5A5 5 0 0 0 18 8h-1.3A8 8 0 1 0 4 16.3" />
  </Icon>
);

const Loader2 = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </Icon>
);

const Sparkles = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3ZM19 13l-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13ZM5 14l-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z" />
  </Icon>
);

const AlertTriangle = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 3 10 18H2L12 3Z" />
    <path d="M12 9v4M12 17h.01" />
  </Icon>
);

const Lock = (props: IconProps) => (
  <Icon {...props}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

const Mail = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);

const Phone = (props: IconProps) => (
  <Icon {...props}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
  </Icon>
);

const Linkedin = (props: IconProps) => (
  <Icon {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
  </Icon>
);

export default function ProfileResume() {
  const [aiConsent, setAiConsent] = useState(true);
  const [dataRetention, setDataRetention] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header / Navbar */}
      <header className="candidate-header">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span>Workspace</span>
          <span>/</span>
          <span>Candidate</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">Profile & Resume</span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <CandidateSearchInput />

          {/* Live Sync Status */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live Sync
          </div>

          {/* Save Button */}
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="p-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            My Profile & Resume
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your candidate profile current and review the information
            extracted from your latest CV.
          </p>
        </div>

        {/* Profile Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Candidate Info Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Candidate Info
                </h2>
                <span className="text-xs text-slate-400">
                  Last updated today
                </span>
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  HL
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Harriet Lawrence
                  </h3>
                  <p className="text-sm text-slate-500">
                    Senior Product Designer · London, UK
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Email</div>
                    <div className="font-medium text-slate-700">
                      harriet.lawrence@example.com
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Phone</div>
                    <div className="font-medium text-slate-700">
                      +44 7700 900 218
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Linkedin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">LinkedIn</div>
                    <div className="font-medium text-slate-700">
                      linkedin.com/in/harriet-lawrence
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Consent Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Privacy & Consent
                </h2>
                <p className="text-xs text-slate-500">
                  Required permissions for secure profile processing and
                  candidate services.
                </p>
              </div>

              <div className="space-y-4">
                {/* Consent Item 1 */}
                <div className="flex items-center justify-between py-2">
                  <div className="pr-4">
                    <div className="text-sm font-semibold text-slate-800">
                      Allow AI CV processing
                    </div>
                    <p className="text-xs text-slate-500">
                      Use AI to extract and organize information from uploaded
                      CVs.
                    </p>
                  </div>
                  <button
                    onClick={() => setAiConsent(!aiConsent)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      aiConsent ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        aiConsent ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Consent Item 2 */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="pr-4">
                    <div className="text-sm font-semibold text-slate-800">
                      Data retention agreement
                    </div>
                    <p className="text-xs text-slate-500">
                      Retain profile data for 12 months in line with recruitment
                      policy.
                    </p>
                  </div>
                  <button
                    onClick={() => setDataRetention(!dataRetention)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      dataRetention ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        dataRetention ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  Mandatory · Changes are recorded in your consent history.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* CV Upload Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-lg font-bold text-slate-900">CV Upload</h2>
                <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600">
                  Version 4.2
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition hover:border-indigo-300 hover:bg-slate-50">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Upload latest CV (PDF/DOCX, max 10MB)
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Drag and drop or click to browse
                </p>
              </div>

              {/* Progress Section */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>PROCESSING...</span>
                  </div>
                  <span className="text-slate-600">72%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[72%] rounded-full bg-indigo-600 transition-all duration-300"></div>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  AI is identifying work history, skills, and contact details.
                </p>
              </div>
            </div>

            {/* AI Extraction Preview Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900">
                    AI Extraction Preview
                  </h2>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-700">
                  84% CONFIDENCE
                </span>
              </div>

              {/* Structured Data */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Current role</div>
                  <div className="text-sm font-semibold text-slate-800">
                    Senior Product Designer
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Experience</div>
                  <div className="text-sm font-semibold text-slate-800">
                    8 years
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Location</div>
                  <div className="text-sm font-semibold text-slate-800">
                    London, United Kingdom
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">
                    Most recent employer
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    Northstar Labs
                  </div>
                </div>
              </div>

              {/* Extracted Skills */}
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold text-slate-500">
                  Extracted Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "UI/UX",
                    "React",
                    "Figma",
                    "Design Systems",
                    "Prototyping",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extraction Warning */}
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Missing Education details</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
