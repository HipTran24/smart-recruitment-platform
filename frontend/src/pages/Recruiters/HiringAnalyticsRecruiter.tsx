import { ChangeEvent, useMemo, useState } from "react";

type Metric = {
  label: string;
  value: string;
  detail: string;
  color: "green" | "blue";
};

type FunnelStage = {
  label: string;
  count: string;
  percentage: string;
  width: string;
  dropOff?: string;
  color: "blue" | "green";
};

type Skill = {
  name: string;
  value: number;
  width: string;
};

type Requisition = {
  name: string;
  department: string;
  applicants: string;
  match: string;
  time: string;
  outcome: string;
  status: "filled" | "pending";
};

const metrics: Metric[] = [
  {
    label: "OVERALL HIRED RATE",
    value: "4.8%",
    detail: "+0.6% vs benchmark",
    color: "green",
  },
  {
    label: "AVG TIME TO HIRE",
    value: "14.2 days",
    detail: "-2.4d vs target",
    color: "green",
  },
  {
    label: "AI MATCH ACCURACY",
    value: "89.2%",
    detail: "rubric-aligned",
    color: "blue",
  },
  {
    label: "OFFER ACCEPTANCE",
    value: "85.7%",
    detail: "6/7 offers",
    color: "blue",
  },
];

const funnelStages: FunnelStage[] = [
  {
    label: "Inflow",
    count: "184",
    percentage: "100%",
    width: "100%",
    dropOff: "-23% drop-off rate",
    color: "blue",
  },
  {
    label: "Screened",
    count: "142",
    percentage: "77%",
    width: "77%",
    dropOff: "-80% drop-off rate",
    color: "blue",
  },
  {
    label: "Interview",
    count: "28",
    percentage: "15%",
    width: "25%",
    dropOff: "-78% drop-off rate",
    color: "blue",
  },
  {
    label: "Offer",
    count: "6",
    percentage: "3.2%",
    width: "8%",
    color: "green",
  },
];

const skills: Skill[] = [
  { name: "Java", value: 42, width: "85%" },
  { name: "Figma", value: 38, width: "75%" },
  { name: "Spring Boot", value: 34, width: "68%" },
  { name: "React", value: 29, width: "58%" },
  { name: "MySQL", value: 24, width: "48%" },
];

const requisitions: Requisition[] = [
  {
    name: "Senior Backend Developer",
    department: "Engineering",
    applicants: "48",
    match: "86.4%",
    time: "12.5 days",
    outcome: "2/2",
    status: "filled",
  },
  {
    name: "Lead UX Researcher",
    department: "Product Design",
    applicants: "36",
    match: "88.1%",
    time: "15.0 days",
    outcome: "1/1",
    status: "filled",
  },
  {
    name: "Product Marketing Lead",
    department: "Growth",
    applicants: "18",
    match: "78.5%",
    time: "16.2 days",
    outcome: "0/1",
    status: "pending",
  },
];

// Component thanh điều hướng bên trái (Sidebar)
export const RecruitmentNavigationSidebarSection = () => {
  const [activeItem, setActiveItem] = useState("Hiring Analytics");

  const navigationItems = [
    { label: "Overview" },
    { label: "Jobs" },
    { label: "Candidates" },
    { label: "Evaluations & Feedback" },
    { label: "Interview Calendar" },
    { label: "Hiring Analytics" },
    { label: "Notifications & Audit Log" },
  ];

  return (
    <aside
      className="flex flex-col w-60 items-start justify-between min-h-screen p-4 bg-white border-r border-slate-200 shrink-0"
      aria-label="Recruitment navigation"
    >
      <div className="flex flex-col w-full gap-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex w-8 h-8 items-center justify-center bg-blue-600 rounded-lg text-white font-bold text-sm">
            S
          </div>
          <span className="font-extrabold text-slate-900 text-lg">
            SmartRecruit
          </span>
        </div>

        <div className="px-2 text-[10px] font-bold text-slate-400 tracking-wider">
          MANAGER WORKSPACE
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1 w-full">
          {navigationItems.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveItem(item.label)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 p-2 w-full border-t border-slate-200 pt-4">
        <div className="flex flex-col w-9 h-9 items-center justify-center bg-blue-50 rounded-full border border-blue-200 text-blue-700 font-bold text-xs">
          AJ
        </div>
        <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate w-full">
            Alex Johnson
          </div>
          <div className="text-[11px] text-slate-500 truncate w-full">
            Hiring Manager
          </div>
        </div>
      </div>
    </aside>
  );
};

// Component nội dung phân tích tuyển dụng
export const HiringAnalyticsDashboardSection = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequisitions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return requisitions;
    }
    return requisitions.filter((requisition) =>
      `${requisition.name} ${requisition.department}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleExport = () => {
    const report = [
      "Requisition, Department, Applicants, Avg Match, Time, Outcome",
      ...requisitions.map(
        (r) =>
          `"${r.name}","${r.department}","${r.applicants}","${r.match}","${r.time}","${r.outcome}"`
      ),
    ].join("\n");

    const blob = new Blob([report], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hiring-analytics-report.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col items-start flex-1 grow bg-slate-50 min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 w-full bg-white border-b border-slate-200">
        <nav aria-label="Breadcrumb">
          <p className="text-xs text-slate-500">
            Workspace / Manager /{" "}
            <span className="font-semibold text-slate-900">Hiring Analytics</span>
          </p>
        </nav>
        <div className="flex items-center gap-3">
          <label className="flex w-60 items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 text-xs">🔍</span>
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search metrics..."
              aria-label="Search requisitions and metrics"
              className="flex-1 bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400"
            />
          </label>
          <div
            role="status"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200"
          >
            <span className="bg-green-600 w-1.5 h-1.5 rounded-full" />
            <span className="font-bold text-green-600 text-[10px] whitespace-nowrap">
              Live Sync
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-start gap-6 p-8 w-full">
        {/* Tiêu đề & Xuất báo cáo */}
        <section
          aria-labelledby="analytics-title"
          className="flex items-center justify-between w-full"
        >
          <div>
            <h1
              id="analytics-title"
              className="font-bold text-slate-900 text-2xl"
            >
              Hiring Analytics &amp; Velocity
            </h1>
            <p className="text-slate-500 text-sm">
              Monitor conversion funnels, skill distribution metrics, and
              time-to-hire velocity
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold"
          >
            <span>↓</span> Export Report
          </button>
        </section>

        {/* Thẻ chỉ số tổng quan */}
        <section
          aria-label="Hiring performance metrics"
          className="grid grid-cols-4 gap-4 w-full"
        >
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="flex flex-col items-start justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm h-28"
            >
              <h2 className="font-bold text-slate-500 text-[10px] tracking-wider">
                {metric.label}
              </h2>
              <p className="font-bold text-[28px] text-slate-900 leading-none">
                {metric.value}
              </p>
              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    metric.color === "green" ? "bg-green-600" : "bg-blue-600"
                  }`}
                />
                <span
                  className={`font-medium ${
                    metric.color === "green"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {metric.detail}
                </span>
              </div>
            </article>
          ))}
        </section>

        {/* Funnel và Kỹ năng */}
        <section className="grid grid-cols-3 gap-5 w-full">
          <article className="col-span-2 flex flex-col items-start gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-base">
              Recruitment Funnel Conversion
            </h2>
            <div className="flex flex-col gap-3 w-full">
              {funnelStages.map((stage) => (
                <div key={stage.label} className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1 h-3 rounded-sm ${
                          stage.color === "green"
                            ? "bg-green-600"
                            : "bg-blue-600"
                        }`}
                      />
                      <span className="font-medium text-slate-800">
                        {stage.label}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-slate-900">
                      {stage.count}{" "}
                      <span className="font-normal text-slate-500 text-xs">
                        ({stage.percentage})
                      </span>
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 h-5 rounded-md overflow-hidden">
                    <div
                      className={`h-full rounded-md ${
                        stage.color === "green"
                          ? "bg-green-600"
                          : "bg-blue-600"
                      }`}
                      style={{ width: stage.width }}
                    />
                  </div>
                  {stage.dropOff && (
                    <span className="text-[11px] text-slate-400 pl-2">
                      {stage.dropOff}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="flex flex-col items-start gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-base">
              Skill Supply vs Demand
            </h2>
            <div className="flex flex-col gap-3.5 w-full">
              {skills.map((skill) => (
                <div key={skill.name} className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {skill.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {skill.value}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: skill.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Bảng chi tiết hiệu suất các vị trí tuyển dụng */}
        <section className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-bold text-slate-900 text-base">
              Requisition Performance Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Requisition</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Applicants</th>
                  <th className="px-6 py-3">Avg Match</th>
                  <th className="px-6 py-3">Avg Time</th>
                  <th className="px-6 py-3">Hired Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequisitions.map((r) => (
                  <tr key={r.name} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {r.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs">
                        {r.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800">{r.applicants}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {r.match}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{r.time}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          r.status === "filled"
                            ? "bg-emerald-50 border-emerald-200 text-green-600"
                            : "bg-amber-50 border-amber-200 text-amber-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.status === "filled"
                              ? "bg-green-600"
                              : "bg-amber-600"
                          }`}
                        />
                        {r.outcome} (
                        {r.status === "filled" ? "100% Filled" : "Pending"})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequisitions.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-500">
                No requisitions match your search.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

// Component chính export ra ngoài cho ứng dụng
export default function HiringAnalyticsRecruiter() {
  return <HiringAnalyticsDashboardSection />;
}