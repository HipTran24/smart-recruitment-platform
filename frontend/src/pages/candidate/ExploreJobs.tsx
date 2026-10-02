import { Link } from "react-router-dom";

export default function ExploreJobs() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      {/* ================= MAIN AREA ================= */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* ================= TOP BAR ================= */}
        <header className="candidate-header">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Workspace</span>
            <span className="text-slate-300">/</span>

            <span className="text-slate-500">Candidate</span>
            <span className="text-slate-300">/</span>

            <span className="font-medium text-slate-900">Explore Jobs</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="flex h-10 w-80 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <span className="text-sm text-slate-400">
                Search job titles, skills...
              </span>
            </div>

            {/* Live Sync */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-sm font-medium text-emerald-700">
                Live Sync
              </span>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <section className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1200px] px-8 py-8">
            {/* ================= TITLE ================= */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Explore Career Opportunities
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Discover open roles matched to your verified skill profile and
                  career goals
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Saved Jobs (3)
              </button>
            </div>

            {/* ================= KPI CARDS ================= */}
            <div className="mb-8 grid grid-cols-4 gap-4">
              <KpiCard
                title="OPEN ROLES"
                value="42"
                description="active positions"
              />

              <KpiCard
                title="HIGH MATCH FOR YOU"
                value="8"
                description=">80% match"
              />

              <KpiCard
                title="REMOTE POSITIONS"
                value="15"
                description="flexible choices"
              />

              <KpiCard
                title="NEW THIS WEEK"
                value="6"
                description="recently posted"
              />
            </div>

            {/* ================= FILTER AREA ================= */}
            <div className="mb-6 flex items-center justify-between gap-6">
              {/* Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600"
                >
                  All Roles (42)
                </button>

                <button
                  type="button"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                  Design & UX (12)
                </button>

                <button
                  type="button"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                  Software Engineering (18)
                </button>

                <button
                  type="button"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                  Product & Growth (12)
                </button>
              </div>

              {/* Dropdowns */}
              <div className="flex shrink-0 items-center gap-2">
                <FilterButton text="Location: Remote, Hybrid" />
                <FilterButton text="Level: Senior, Lead" />
                <FilterButton text="Sort: Match Relevance" />
              </div>
            </div>

            {/* ================= JOB LIST ================= */}
            <div className="space-y-4">
              {/* JOB 1 */}
              <JobCard
                title="Lead UX Researcher"
                subtitle="Product Design • Full-time / Remote"
                match="92% MATCH"
                deadline="Deadline: Oct 15"
                skills={["Figma", "User Testing"]}
                button="Apply Now"
              />

              {/* JOB 2 */}
              <JobCard
                title="Senior Product Designer"
                subtitle="Design • Hybrid"
                match="86% MATCH"
                deadline="Deadline: Oct 20"
                skills={["Figma", "Design Systems"]}
                button="Apply Now"
              />

              {/* JOB 3 */}
              <JobCard
                title="UX Strategist"
                subtitle="Strategy • Remote"
                match="78% MATCH"
                deadline="Deadline: Oct 28"
                skills={["UX Strategy", "Analytics"]}
                button="View Details"
                mutedMatch
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

type KpiCardProps = {
  title: string;
  value: string;
  description: string;
};

function KpiCard({ title, value, description }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide text-slate-500">
          {title}
        </span>

        <span className="h-2 w-2 rounded-full bg-blue-500" />
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>

        <span className="pb-1 text-xs text-slate-500">{description}</span>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

type FilterButtonProps = {
  text: string;
};

function FilterButton({ text }: FilterButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {text}

      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-slate-400"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

/* =========================================================
   JOB CARD
========================================================= */

type JobCardProps = {
  title: string;
  subtitle: string;
  match: string;
  deadline: string;
  skills: string[];
  button: string;
  mutedMatch?: boolean;
};

function JobCard({
  title,
  subtitle,
  match,
  deadline,
  skills,
  button,
  mutedMatch = false,
}: JobCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {/* Card Body */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Job Information */}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

            {/* Skills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Match Badge */}
          <div
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              mutedMatch
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {match}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Card Footer */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-sm text-slate-500">{deadline}</span>

        {button === "View Details" ? (
          <Link
            to="/views_details"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {button}
          </Link>
        ) : (
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {button}
          </button>
        )}
      </div>
    </div>
  );
}
