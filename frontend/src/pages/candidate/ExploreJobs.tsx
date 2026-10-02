import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CandidateSearchInput } from "@/components/Candidate/CandidateSearchInput";

type JobItem = {
  id: string;
  title: string;
  department: string;
  category: "Design & UX" | "Software Engineering" | "Product & Growth";
  type: string;
  location: string;
  salary: string;
  match: string;
  matchScore: number;
  deadline: string;
  skills: string[];
  featured?: boolean;
};

const allJobs: JobItem[] = [
  {
    id: "REQ-89024",
    title: "Lead UX Researcher",
    department: "Product Design",
    category: "Design & UX",
    type: "Full-time",
    location: "Remote / San Francisco",
    salary: "$150k - $175k",
    match: "92% MATCH",
    matchScore: 92,
    deadline: "Deadline: Oct 15",
    skills: ["Figma", "User Testing", "System Design", "Quant/Qual Labs"],
    featured: true,
  },
  {
    id: "REQ-89025",
    title: "Senior Product Designer",
    department: "Design Systems",
    category: "Design & UX",
    type: "Hybrid",
    location: "New York, NY",
    salary: "$140k - $160k",
    match: "86% MATCH",
    matchScore: 86,
    deadline: "Deadline: Oct 20",
    skills: ["Figma", "Design Tokens", "Accessibility WCAG", "Prototyping"],
  },
  {
    id: "REQ-89026",
    title: "UX Strategist",
    department: "Core Experience",
    category: "Design & UX",
    type: "Remote",
    location: "Remote (US / Europe)",
    salary: "$145k - $165k",
    match: "78% MATCH",
    matchScore: 78,
    deadline: "Deadline: Oct 28",
    skills: ["UX Strategy", "Behavioral Analytics", "IA Blueprints"],
  },
  {
    id: "REQ-89027",
    title: "Senior Backend Engineer (Java / Spring)",
    department: "Cloud Platform",
    category: "Software Engineering",
    type: "Full-time",
    location: "Remote / Seattle",
    salary: "$165k - $190k",
    match: "84% MATCH",
    matchScore: 84,
    deadline: "Deadline: Nov 05",
    skills: ["Java 21", "Spring Boot", "MySQL", "AWS ECS", "Kafka"],
  },
  {
    id: "REQ-89028",
    title: "Staff Frontend Architect (React & TS)",
    department: "Design Systems",
    category: "Software Engineering",
    type: "Hybrid",
    location: "San Francisco, CA",
    salary: "$175k - $205k",
    match: "88% MATCH",
    matchScore: 88,
    deadline: "Deadline: Oct 25",
    skills: ["React 19", "TypeScript", "Tailwind CSS", "Vite", "Web Performance"],
  },
  {
    id: "REQ-89029",
    title: "Principal Product Manager (AI Platform)",
    department: "Product & Growth",
    category: "Product & Growth",
    type: "Full-time",
    location: "Remote",
    salary: "$180k - $210k",
    match: "81% MATCH",
    matchScore: 81,
    deadline: "Deadline: Nov 10",
    skills: ["AI Product Strategy", "LLM Evals", "Roadmap Execution", "B2B SaaS"],
  },
];

export default function ExploreJobs() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [savedJobs, setSavedJobs] = useState<string[]>(["REQ-89024"]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSaveJob = (id: string) => {
    if (savedJobs.includes(id)) {
      setSavedJobs(savedJobs.filter((item) => item !== id));
      showToast("Removed from saved jobs");
    } else {
      setSavedJobs([...savedJobs, id]);
      showToast("Saved to your bookmarks");
    }
  };

  const searchQuery = searchParams.get("search")?.trim().toLowerCase() ?? "";

  const filteredJobs = allJobs.filter((job) => {
    const matchesCategory =
      selectedCategory === "All" || job.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      [job.title, job.department, job.location, ...job.skills]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="candidate-header">
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition">Workspace</Link>
          <span className="text-slate-300">/</span>
          <Link to="/my-applications" className="hover:text-slate-800 transition">Candidate</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">Explore Jobs</span>
        </div>

        <div className="flex items-center gap-4">
          <CandidateSearchInput />
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Sync
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Explore Career Opportunities
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover roles matched against your verified skills, experience level, and preferred locations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast(`You have ${savedJobs.length} bookmarked roles`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 flex items-center gap-2"
            >
              <span>★</span>
              <span>Saved Jobs ({savedJobs.length})</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                OPEN REQUISITIONS
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">42</span>
              <span className="text-xs text-slate-500">active roles</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                HIGH MATCH (&gt;80%)
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">8</span>
              <span className="text-xs text-emerald-600 font-medium">aligned with CV</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                REMOTE OPPORTUNITIES
              </span>
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">15</span>
              <span className="text-xs text-slate-500">work from anywhere</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                NEW THIS WEEK
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">6</span>
              <span className="text-xs text-amber-600 font-medium">recently posted</span>
            </div>
          </div>
        </div>

        {/* Filter Area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
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

        {/* Job Cards List */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              const isHighMatch = job.matchScore >= 85;

              return (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                          {job.id}
                        </span>
                        <span className="text-xs text-slate-400">• {job.department}</span>
                        <span className="text-xs text-slate-400">• {job.location}</span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          isHighMatch
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {job.match}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {job.salary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">
                      {job.deadline}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 rounded-lg border transition ${
                          isSaved
                            ? "bg-amber-50 border-amber-300 text-amber-600"
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        }`}
                        title={isSaved ? "Remove bookmark" : "Save job"}
                      >
                        ★
                      </button>
                      <Link
                        to="/views_details"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                      >
                        View Details &amp; Apply →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No positions found matching your search criteria.
            </div>
          )}
        </div>
      </div>

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
