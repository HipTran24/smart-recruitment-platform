import { useMemo, useState } from "react";

type JobStatus = "Published" | "Closing Soon";

type Job = {
  title: string;
  department: string;
  type: string;
  skills: string[];
  applicants: number;
  highMatch?: number;
  requirements: string;
  experience: string;
  status: JobStatus;
  action: string;
};

const stats = [
  { label: "ACTIVE JOBS", value: "12", detail: "+2 this week", detailClass: "text-green-600" },
  { label: "TOTAL APPLICANTS", value: "184", detail: "across active roles", detailClass: "text-slate-500" },
  { label: "AVG MATCH RATE", value: "84.5%", detail: "scoring engine", detailClass: "text-slate-500" },
  { label: "CLOSING SOON", value: "3", detail: "within 7 days", detailClass: "text-amber-600" },
];

const tabs = [
  { label: "All", count: 15 },
  { label: "Published", count: 12 },
  { label: "Drafts", count: 2 },
  { label: "Closed", count: 1 },
];

const jobs: Job[] = [
  {
    title: "Senior Backend Developer",
    department: "Engineering",
    type: "Full-time",
    skills: ["Java", "Spring Boot", "MySQL"],
    applicants: 48,
    highMatch: 12,
    requirements: "40%",
    experience: "30%",
    status: "Published",
    action: "Manage Pipeline",
  },
  {
    title: "Lead UX Researcher",
    department: "Product Design",
    type: "Full-time",
    skills: ["Figma", "User Testing"],
    applicants: 36,
    highMatch: 9,
    requirements: "40%",
    experience: "35%",
    status: "Published",
    action: "Manage Pipeline",
  },
  {
    title: "Product Marketing Lead",
    department: "Growth",
    type: "Full-time",
    skills: ["GTM", "Analytics"],
    applicants: 18,
    requirements: "30%",
    experience: "40%",
    status: "Closing Soon",
    action: "Review Applicants",
  },
];

// Phần nội dung chính quản lý danh sách công việc (Jobs Dashboard)
const JobRequisitionsDashboardSection = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("Department: Engineering, Design, Product");
  const [sort, setSort] = useState("Sort: Newest");
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.skills.some((skill) => skill.toLowerCase().includes(normalizedSearch));

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Published" && job.status === "Published") ||
        (activeTab === "Closed" && job.status === "Closing Soon") ||
        activeTab === "Drafts";

      const matchesDepartment =
        department === "Department: Engineering, Design, Product" ||
        job.department === department.replace("Department: ", "");

      return matchesSearch && matchesTab && matchesDepartment;
    });
  }, [activeTab, department, search]);

  const visibleJobs = filteredJobs.length > 0 ? filteredJobs : jobs;

  return (
    <main className="flex min-h-screen w-full flex-col items-start bg-slate-50 flex-1">
      {/* Header */}
      <header className="flex h-16 w-full items-center justify-between px-7 bg-white border-b border-slate-200">
        <p className="text-xs text-slate-500">
          Workspace / Manager / <span className="font-semibold text-slate-900">Jobs</span>
        </p>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job titles, skills..."
            className="w-[280px] h-9 px-3 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex h-[30px] items-center gap-1.5 px-2.5 bg-white rounded-full border border-slate-200">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            <span className="font-bold text-green-600 text-[10px]">Live Sync</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-col items-start gap-6 p-7 w-full">
        {/* Title & Action */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-slate-900 text-2xl font-bold">Job Requisitions & Postings</h1>
            <p className="text-slate-500 text-sm">Configure skill matching criteria, manage listing lifecycles, and monitor pipelines</p>
          </div>
          <button
            onClick={() => window.alert("New job requisition started")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
          >
            <span>+</span> Post New Job
          </button>
        </div>

        {/* Metrics Grid */}
        <section className="grid grid-cols-4 gap-4 w-full">
          {stats.map((stat) => (
            <article key={stat.label} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between h-28 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-slate-500 text-[10px] font-bold tracking-wide">{stat.label}</h2>
                <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 font-bold text-xs">📊</div>
              </div>
              <div className="flex items-baseline gap-2">
                <strong className="text-slate-900 text-3xl font-bold">{stat.value}</strong>
                <span className={`text-[10px] font-semibold ${stat.detailClass}`}>{stat.detail}</span>
              </div>
            </article>
          ))}
        </section>

        {/* Filter Tabs & Dropdowns */}
        <div className="flex items-center justify-between w-full">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  activeTab === tab.label ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab.label ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDepartment(department.includes("Engineering") ? "Product Design" : "Engineering")}
              className="px-3 h-9 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 font-medium"
            >
              {department}
            </button>
            <button
              onClick={() => setSort(sort.includes("Newest") ? "Sort: Oldest" : "Sort: Newest")}
              className="px-3 h-9 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 font-medium"
            >
              {sort}
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <section className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex h-12 items-center justify-between px-5 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 text-sm font-bold">Master Jobs</h2>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">15 records</span>
            </div>
          </div>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_120px] items-center px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
            <div>JOB</div>
            <div>SKILLS</div>
            <div>APPLICANTS</div>
            <div>MATCH WEIGHTS</div>
            <div>STATUS</div>
            <div className="text-right">ACTION</div>
          </div>
          {visibleJobs.map((job) => (
            <article key={job.title} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_120px] items-center px-5 py-4 border-b border-slate-100 bg-white text-sm">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{job.title}</h3>
                <p className="text-xs text-slate-500">{job.department} • {job.type}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-xs">{job.applicants} Applicants</div>
                {job.highMatch && <div className="text-[10px] font-semibold text-green-600">● {job.highMatch} High Match</div>}
              </div>
              <div className="text-xs text-slate-600">
                <div>Req: <strong>{job.requirements}</strong></div>
                <div>Exp: <strong>{job.experience}</strong></div>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${job.status === "Published" ? "bg-emerald-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${job.status === "Published" ? "bg-green-600" : "bg-amber-600"}`} />
                  {job.status}
                </span>
              </div>
              <div className="text-right">
                <button
                  onClick={() => window.alert(`${job.action}: ${job.title}`)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {job.action}
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

// Component chính cho trang Job Management
export default function JobManagement() {
  return <JobRequisitionsDashboardSection />;
}