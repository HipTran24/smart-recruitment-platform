import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { aiMatchBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/States";

type JobItem = {
  id: string;
  title: string;
  department: string;
  category: "Design & UX" | "Software Engineering" | "Product & Growth";
  type: string;
  location: string;
  salary: string;
  matchScore: number;
  deadline: string;
  skills: string[];
  featured?: boolean;
};

const allJobs: JobItem[] = [
  {
    id: "REQ-89024",
    title: "Lead UX Researcher",
    department: "Product Design Squad",
    category: "Design & UX",
    type: "Full-time • Remote",
    location: "Remote / San Francisco",
    salary: "$150,000 - $175,000",
    matchScore: 92,
    deadline: "Deadline: Oct 15, 2026",
    skills: ["Figma", "User Testing", "System Design", "Quant/Qual Labs"],
    featured: true,
  },
  {
    id: "REQ-89025",
    title: "Senior Product Designer",
    department: "Design Systems Squad",
    category: "Design & UX",
    type: "Full-time • Hybrid",
    location: "New York, NY",
    salary: "$140,000 - $160,000",
    matchScore: 86,
    deadline: "Deadline: Oct 20, 2026",
    skills: ["Figma", "Design Tokens", "Accessibility WCAG", "Prototyping"],
  },
  {
    id: "REQ-89026",
    title: "UX Strategist",
    department: "Core Experience Squad",
    category: "Design & UX",
    type: "Full-time • Remote",
    location: "Remote (US / Europe)",
    salary: "$145,000 - $165,000",
    matchScore: 78,
    deadline: "Deadline: Oct 28, 2026",
    skills: ["UX Strategy", "Behavioral Analytics", "IA Blueprints"],
  },
  {
    id: "REQ-89027",
    title: "Senior Backend Engineer (Java / Spring)",
    department: "Cloud Platform Squad",
    category: "Software Engineering",
    type: "Full-time • Remote",
    location: "Remote / Seattle",
    salary: "$165,000 - $190,000",
    matchScore: 84,
    deadline: "Deadline: Nov 05, 2026",
    skills: ["Java 25", "Spring Boot", "MySQL", "AWS ECS", "Kafka"],
  },
  {
    id: "REQ-89028",
    title: "Staff Frontend Architect (React & TS)",
    department: "Design Systems Squad",
    category: "Software Engineering",
    type: "Full-time • Hybrid",
    location: "San Francisco, CA",
    salary: "$175,000 - $205,000",
    matchScore: 88,
    deadline: "Deadline: Oct 25, 2026",
    skills: ["React 19", "TypeScript", "Tailwind CSS", "Vite", "Web Performance"],
  },
  {
    id: "REQ-89029",
    title: "Principal Product Manager (AI Platform)",
    department: "Product & Growth Squad",
    category: "Product & Growth",
    type: "Full-time • Remote",
    location: "Remote",
    salary: "$180,000 - $210,000",
    matchScore: 81,
    deadline: "Deadline: Nov 10, 2026",
    skills: ["AI Product Strategy", "LLM Evals", "Roadmap Execution", "B2B SaaS"],
  },
];

export default function ExploreJobs() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [savedJobs, setSavedJobs] = useState<string[]>(["REQ-89024"]);
  const [localSearch, setLocalSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSaveJob = (id: string, title: string) => {
    if (savedJobs.includes(id)) {
      setSavedJobs(savedJobs.filter((item) => item !== id));
      showToast(`Removed "${title}" from saved bookmarks`);
    } else {
      setSavedJobs([...savedJobs, id]);
      showToast(`Saved "${title}" to your bookmarks`);
    }
  };

  const urlSearch = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const query = (localSearch || urlSearch).toLowerCase();

  const filteredJobs = allJobs.filter((job) => {
    const matchesCategory =
      selectedCategory === "All" || job.category === selectedCategory;
    const matchesSearch =
      !query ||
      [job.title, job.department, job.location, ...job.skills]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
      {/* Candidate Standard Sticky Header */}
      <header className="candidate-header">
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition">
            Workspace
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/my-applications" className="hover:text-slate-800 transition">
            Candidate
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">Explore Jobs</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Opportunities</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-['Inter',sans-serif]">
              Explore Career Opportunities
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
              Discover roles matched against your verified skills, experience level, and preferred locations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => showToast(`You have ${savedJobs.length} bookmarked roles`)}
              icon={<span>★</span>}
            >
              Saved Jobs ({savedJobs.length})
            </Button>
          </div>
        </div>

        {/* Search & Category Filter Strip */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                placeholder="Search job title, skills (e.g. Figma, Spring Boot, React)..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            {localSearch && (
              <Button
                variant="ghost"
                size="md"
                onClick={() => setLocalSearch("")}
              >
                Clear Search
              </Button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Design & UX", "Software Engineering", "Product & Growth"].map((cat) => {
                const count =
                  cat === "All"
                    ? allJobs.length
                    : allJobs.filter((j) => j.category === cat).length;
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredJobs.length} open opportunities
            </span>
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex flex-col gap-4">
          {filteredJobs.length === 0 ? (
            <EmptyState
              title="No open positions found"
              description="No job postings matched your current search filters. Try clearing your search keyword."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLocalSearch("");
                    setSelectedCategory("All");
                  }}
                >
                  Reset all filters
                </Button>
              }
            />
          ) : (
            filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);

              return (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col gap-4"
                >
                  {/* Top: Title, Department, Meta & AI Match Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {job.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{job.department}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium">{job.type}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium">{job.location}</span>
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {job.title}
                      </h2>

                      {/* Salary */}
                      <p className="text-xs font-semibold text-emerald-700">
                        {job.salary} • Competitive Equity &amp; Healthcare
                      </p>

                      {/* Skills Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <div title="Advisory AI compatibility score based on your uploaded CV">
                        {aiMatchBadge(job.matchScore)}
                      </div>
                      <span className="text-xs text-slate-400 font-medium sm:text-right">
                        Deterministic Advisory
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Deadline & CTA Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{job.deadline}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job.id, job.title)}
                        aria-label={isSaved ? `Remove ${job.title} from bookmarks` : `Save ${job.title} to bookmarks`}
                        aria-pressed={isSaved}
                        className={`min-h-[38px] px-3 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                          isSaved
                            ? "bg-amber-50 border-amber-300 text-amber-600 font-bold"
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="mr-1">★</span>
                        <span className="text-xs">{isSaved ? "Saved" : "Save"}</span>
                      </button>

                      <Link to="/views_details">
                        <Button
                          variant="primary"
                          size="md"
                          className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                        >
                          View Details &amp; Apply →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
}
