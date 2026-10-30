import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FilterChips } from "@/components/ui/FilterChips";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, aiMatchBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/States";

export type Candidate = {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  department: "Design" | "Engineering" | "Marketing" | "Data";
  matchValue: number;
  skills: string[];
  stage: "Screened" | "Interviewing" | "Offer Stage" | "Applied" | "Archived";
  review: "Ready" | "Approved" | "Needs Review" | "Pending";
  appliedDate: string;
  breakdown: {
    coreSkills: number;
    experience: number;
    domainKnowledge: number;
    notes: string;
  };
};

const initialCandidates: Candidate[] = [
  {
    id: "cand-1",
    initials: "HL",
    name: "Harriet Lawrence",
    email: "harriet.l@example.com",
    role: "Lead UX Researcher",
    department: "Design",
    matchValue: 92,
    skills: ["Figma", "User Testing", "Information Architecture", "Heuristic Evaluation"],
    stage: "Interviewing",
    review: "Ready",
    appliedDate: "Sep 18, 2026",
    breakdown: {
      coreSkills: 94,
      experience: 90,
      domainKnowledge: 92,
      notes: "Extensive enterprise design research portfolio. Matches Figma and User Testing requisitions closely.",
    },
  },
  {
    id: "cand-2",
    initials: "MB",
    name: "Marcus Broadus",
    email: "marcus.b@example.com",
    role: "Senior Backend Developer",
    department: "Engineering",
    matchValue: 88,
    skills: ["Java", "Spring Boot", "MySQL", "AWS ECS", "Microservices"],
    stage: "Offer Stage",
    review: "Approved",
    appliedDate: "Sep 15, 2026",
    breakdown: {
      coreSkills: 90,
      experience: 87,
      domainKnowledge: 88,
      notes: "Solid Spring Boot 3+ microservices architecture and clean code. Meets senior criteria.",
    },
  },
  {
    id: "cand-3",
    initials: "SK",
    name: "Sonia Khavis",
    email: "sonia.k@example.com",
    role: "Product Marketing Lead",
    department: "Marketing",
    matchValue: 81,
    skills: ["GTM Strategy", "Product Analytics", "Content Marketing", "B2B SaaS"],
    stage: "Screened",
    review: "Needs Review",
    appliedDate: "Sep 22, 2026",
    breakdown: {
      coreSkills: 82,
      experience: 80,
      domainKnowledge: 81,
      notes: "Strong B2B GTM background, needs manual portfolio review for enterprise technical SaaS alignment.",
    },
  },
  {
    id: "cand-4",
    initials: "DT",
    name: "David Tran",
    email: "david.tran@example.com",
    role: "Frontend Engineer (React)",
    department: "Engineering",
    matchValue: 86,
    skills: ["React 19", "TypeScript", "Tailwind CSS", "Vite", "Accessibility"],
    stage: "Interviewing",
    review: "Ready",
    appliedDate: "Sep 24, 2026",
    breakdown: {
      coreSkills: 89,
      experience: 84,
      domainKnowledge: 85,
      notes: "Demonstrates modern React concurrency patterns and robust accessible component authoring.",
    },
  },
  {
    id: "cand-5",
    initials: "EN",
    name: "Elena Novak",
    email: "elena.n@example.com",
    role: "Lead Data Scientist",
    department: "Data",
    matchValue: 91,
    skills: ["Python", "PyTorch", "NLP", "Gemini API", "Vector Embeddings"],
    stage: "Interviewing",
    review: "Ready",
    appliedDate: "Sep 20, 2026",
    breakdown: {
      coreSkills: 93,
      experience: 91,
      domainKnowledge: 89,
      notes: "Strong expertise with GenAI orchestration and vector similarity retrieval pipelines.",
    },
  },
  {
    id: "cand-6",
    initials: "AL",
    name: "Alexandre Laurent",
    email: "a.laurent@example.com",
    role: "DevOps / Cloud Architect",
    department: "Engineering",
    matchValue: 84,
    skills: ["AWS", "Docker", "Terraform", "Kubernetes", "CI/CD"],
    stage: "Screened",
    review: "Needs Review",
    appliedDate: "Sep 26, 2026",
    breakdown: {
      coreSkills: 86,
      experience: 83,
      domainKnowledge: 83,
      notes: "AWS Certified Solutions Architect with deep infrastructure as code implementation history.",
    },
  },
  {
    id: "cand-7",
    initials: "PL",
    name: "Phuong Le",
    email: "phuong.le@example.com",
    role: "QA Automation Lead",
    department: "Engineering",
    matchValue: 79,
    skills: ["Playwright", "Jest", "TypeScript", "CI/CD", "Load Testing"],
    stage: "Applied",
    review: "Pending",
    appliedDate: "Oct 01, 2026",
    breakdown: {
      coreSkills: 80,
      experience: 78,
      domainKnowledge: 79,
      notes: "Solid automation test framework design with Playwright and Vitest.",
    },
  },
];

const stageColorMap: Record<string, string> = {
  Interviewing: "interviewing",
  "Offer Stage": "offer",
  Screened: "screened",
  Applied: "applied",
  Archived: "gray",
};

export default function CandidateManagement() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [sort, setSort] = useState("match_desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCandidateForBreakdown, setSelectedCandidateForBreakdown] = useState<Candidate | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Filtered & Sorted Candidates
  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = initialCandidates.filter((cand) => {
      const matchSearch =
        !query ||
        cand.name.toLowerCase().includes(query) ||
        cand.role.toLowerCase().includes(query) ||
        cand.skills.some((s) => s.toLowerCase().includes(query));

      const matchDept = department === "All" || cand.department === department;
      const matchStage = stageFilter === "All" || cand.stage === stageFilter;

      let matchTab = true;
      if (activeTab === "High Match >85%") matchTab = cand.matchValue >= 85;
      else if (activeTab === "Interviewing") matchTab = cand.stage === "Interviewing";
      else if (activeTab === "Needs Review") matchTab = cand.review === "Needs Review";
      else if (activeTab === "Offers") matchTab = cand.stage === "Offer Stage";

      return matchSearch && matchDept && matchStage && matchTab;
    });

    if (sort === "match_desc") {
      result.sort((a, b) => b.matchValue - a.matchValue);
    } else if (sort === "match_asc") {
      result.sort((a, b) => a.matchValue - b.matchValue);
    } else if (sort === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, department, stageFilter, activeTab, sort]);

  // Bulk selection handling
  const allFilteredSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Active filter items for chips
  const activeFilters = useMemo(() => {
    const list = [];
    if (search.trim()) {
      list.push({ key: "search", label: "Search", value: search });
    }
    if (department !== "All") {
      list.push({ key: "department", label: "Department", value: department });
    }
    if (stageFilter !== "All") {
      list.push({ key: "stage", label: "Stage", value: stageFilter });
    }
    return list;
  }, [search, department, stageFilter]);

  const handleRemoveFilter = (key: string) => {
    if (key === "search") setSearch("");
    if (key === "department") setDepartment("All");
    if (key === "stage") setStageFilter("All");
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setDepartment("All");
    setStageFilter("All");
    setActiveTab("All");
  };

  const tabs = [
    { label: "All", count: initialCandidates.length },
    { label: "High Match >85%", count: initialCandidates.filter((c) => c.matchValue >= 85).length },
    { label: "Interviewing", count: initialCandidates.filter((c) => c.stage === "Interviewing").length },
    { label: "Needs Review", count: initialCandidates.filter((c) => c.review === "Needs Review").length },
    { label: "Offers", count: initialCandidates.filter((c) => c.stage === "Offer Stage").length },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Recruiter Workspace", href: "/recruiter/console" },
          { label: "Candidates", href: "/recruiter/candidates" },
        ]}
        title="Candidate Pipeline & Sourcing"
        description="Review incoming resumes, inspect transparent Gemini 2.5 skill match criteria, and collaborate with hiring managers."
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/recruiter/candidates/screening">
              <Button variant="secondary" size="md">
                Bulk Screening Hub
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
              onClick={() => showNotification("Add Candidate modal opened")}
            >
              Add Candidate
            </Button>
          </div>
        }
      />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Candidates</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">184</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+12 this week</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Across 8 active job requisitions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI High Matches</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">62</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">&gt;85% Score</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Confidence rating: High</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Interview Rounds</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">28</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">4 today</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Panel & Technical stages</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Extended Offers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">6</span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">2 Accepted</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Final decision window</p>
        </div>
      </div>

      {/* Tabs & Controls Bar */}
      <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                type="button"
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    isActive ? "bg-blue-700/60 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <SearchInput
            placeholder="Search candidate name, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            aria-label="Department Filter"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: "All", label: "All Departments" },
              { value: "Design", label: "Design Squad" },
              { value: "Engineering", label: "Engineering Squad" },
              { value: "Marketing", label: "Product Marketing" },
              { value: "Data", label: "Data & AI Science" },
            ]}
          />

          <Select
            aria-label="Stage Filter"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            options={[
              { value: "All", label: "All Hiring Stages" },
              { value: "Screened", label: "Screened" },
              { value: "Interviewing", label: "Interviewing" },
              { value: "Offer Stage", label: "Offer Stage" },
              { value: "Applied", label: "New Application" },
            ]}
          />

          <Select
            aria-label="Sort Options"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: "match_desc", label: "Match Score (High to Low)" },
              { value: "match_asc", label: "Match Score (Low to High)" },
              { value: "name_asc", label: "Candidate Name (A-Z)" },
            ]}
          />
        </div>

        {/* Active Filter Chips */}
        <FilterChips
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Floating Bulk Action Bar (When Candidates Selected) */}
      {selectedIds.length > 0 && (
        <div
          role="region"
          aria-label="Bulk actions toolbar"
          className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold">
              {selectedIds.length === 1 ? "1 candidate selected" : `${selectedIds.length} candidates selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              onClick={() => showNotification(`Scheduling interviews for ${selectedIds.length} candidates`)}
            >
              Schedule Interview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              onClick={() => showNotification(`Generating AI Feedback drafts for ${selectedIds.length} candidates`)}
            >
              Draft AI Feedback
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Candidates Data Table (Desktop & Tablet) & Cards (Mobile) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {filteredCandidates.length === 0 ? (
          <EmptyState
            title="No candidates match your criteria"
            description="Try loosening your search query, clearing filters, or switching tabs."
            action={
              <Button variant="secondary" size="sm" onClick={handleClearAllFilters}>
                Reset all filters
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all candidates"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5 min-w-[220px]">Candidate</th>
                    <th className="px-4 py-3.5 min-w-[130px]">AI Match</th>
                    <th className="px-4 py-3.5 min-w-[240px]">Key Skills</th>
                    <th className="px-4 py-3.5 min-w-[130px]">Stage</th>
                    <th className="px-4 py-3.5 min-w-[120px]">Evaluation</th>
                    <th className="px-4 py-3.5 text-right min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((cand) => {
                    const isSelected = selectedIds.includes(cand.id);
                    return (
                      <tr
                        key={cand.id}
                        className={`transition-colors hover:bg-slate-50/70 ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(cand.id)}
                            aria-label={`Select ${cand.name}`}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                              {cand.initials}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to="/recruiter/candidates/detail"
                                state={{ candidateId: cand.id }}
                                className="font-semibold text-slate-900 hover:text-blue-600 truncate block transition-colors"
                              >
                                {cand.name}
                              </Link>
                              <span className="text-xs text-slate-500 block truncate">
                                {cand.role} • {cand.department}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidateForBreakdown(cand)}
                            title="Click to view transparent score breakdown"
                            className="inline-flex cursor-pointer hover:opacity-85 focus:outline-hidden"
                          >
                            {aiMatchBadge(cand.matchValue)}
                          </button>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {cand.skills.slice(0, 2).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                              >
                                {skill}
                              </span>
                            ))}
                            {cand.skills.length > 2 && (
                              <span
                                className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-xs font-medium border border-slate-200"
                                title={cand.skills.slice(2).join(", ")}
                              >
                                +{cand.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusBadge
                            variant={stageColorMap[cand.stage] ?? "gray"}
                            label={cand.stage}
                            dot
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`text-xs font-semibold ${
                              cand.review === "Approved"
                                ? "text-emerald-600"
                                : cand.review === "Ready"
                                ? "text-blue-600"
                                : "text-amber-600"
                            }`}
                          >
                            {cand.review}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to="/recruiter/candidates/detail" state={{ candidateId: cand.id }}>
                              <Button variant="secondary" size="sm">
                                View Dossier
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 p-2">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedIds.includes(cand.id);
                return (
                  <div
                    key={cand.id}
                    className={`p-3.5 rounded-xl flex flex-col gap-3 transition-colors ${
                      isSelected ? "bg-blue-50/50 border border-blue-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(cand.id)}
                          aria-label={`Select ${cand.name}`}
                          className="rounded border-slate-300 text-blue-600 w-4 h-4"
                        />
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {cand.initials}
                        </div>
                        <div>
                          <Link
                            to="/recruiter/candidates/detail"
                            className="font-semibold text-slate-900 text-sm hover:underline"
                          >
                            {cand.name}
                          </Link>
                          <div className="text-xs text-slate-500">{cand.role}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCandidateForBreakdown(cand)}
                      >
                        {aiMatchBadge(cand.matchValue)}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cand.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <StatusBadge
                        variant={stageColorMap[cand.stage] ?? "gray"}
                        label={cand.stage}
                        dot
                      />
                      <Link to="/recruiter/candidates/detail" state={{ candidateId: cand.id }}>
                        <Button variant="secondary" size="sm">
                          View Dossier ›
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination with Actual Record Counts */}
            <Pagination
              currentPage={1}
              totalPages={1}
              totalItems={filteredCandidates.length}
              pageSize={10}
              onPageChange={() => {}}
              label={`Showing ${filteredCandidates.length} of ${initialCandidates.length} candidates`}
            />
          </>
        )}
      </div>

      {/* Transparent AI Score Breakdown Modal (Human-In-The-Loop) */}
      <Modal
        open={Boolean(selectedCandidateForBreakdown)}
        onClose={() => setSelectedCandidateForBreakdown(null)}
        title={`AI Match Breakdown: ${selectedCandidateForBreakdown?.name}`}
        description="Gemini 2.5 Flash Advisory Scoring • Human Recruiter retains final recruitment decision."
        width="max-w-xl"
      >
        {selectedCandidateForBreakdown && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
                  Overall Composite Match
                </span>
                <span className="text-2xl font-bold text-indigo-950">
                  {selectedCandidateForBreakdown.matchValue}% Match
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-indigo-600 block">Candidate Target</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {selectedCandidateForBreakdown.role}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Core Technical Competencies</span>
                  <span>{selectedCandidateForBreakdown.breakdown.coreSkills}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${selectedCandidateForBreakdown.breakdown.coreSkills}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Demonstrated Industry Experience</span>
                  <span>{selectedCandidateForBreakdown.breakdown.experience}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${selectedCandidateForBreakdown.breakdown.experience}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Domain & Tooling Familiarity</span>
                  <span>{selectedCandidateForBreakdown.breakdown.domainKnowledge}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${selectedCandidateForBreakdown.breakdown.domainKnowledge}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-bold text-slate-700 block mb-1">AI Match Summary Notes:</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedCandidateForBreakdown.breakdown.notes}
              </p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <span className="text-base leading-none">⚖️</span>
              <p>
                <strong>Human-in-the-Loop Guardrail:</strong> AI scoring is strictly advisory. System policies prohibit automatic rejection based solely on AI inference scores.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCandidateForBreakdown(null)}
              >
                Close
              </Button>
              <Link
                to="/recruiter/candidates/detail"
                state={{ candidateId: selectedCandidateForBreakdown.id }}
              >
                <Button variant="primary" size="sm">
                  Open Complete Dossier
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Floating Toast Notification */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in duration-150"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}