import { Link } from "react-router-dom"
import { apiClient } from "../../lib/api"
import { useResource } from "../../hooks/useResource"
import { Workspace, Panel, ResourceState } from "../../components/ui/Workspace"

export default function RecruiterConsole() {
  const resource = useResource((signal) =>
    apiClient.get<Record<string, number>>(
      "/api/v1/recruiter/reports/overview",
      { signal },
    ),
  )
  const metrics = [
    ["openJobs", "Vị trí đang tuyển"],
    ["totalApplications", "Hồ sơ đã nhận"],
    ["pendingReviews", "Chờ xem xét"],
    ["scheduledInterviews", "Lịch phỏng vấn"],
    ["activeOffers", "Đề nghị đang chờ"],
  ] as const
  return (
    <Workspace
      title="Hiring Operations Dashboard"
      description="Theo dõi hoạt động tuyển dụng của doanh nghiệp."
      actions={
        <Link
          to="/recruiter/jobs/create"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Tạo công việc mới
        </Link>
      }
    >
      <ResourceState resource={resource} />
      {resource.data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map(([key, label]) => (
            <Panel key={key}>
              <p className="text-sm text-slate-600">{label}</p>
              <p className="text-4xl font-semibold tracking-tight">
                {resource.data![key] ?? 0}
              </p>
            </Panel>
          ))}
        </div>
      )}
      <Panel title="Không gian tuyển dụng">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["/recruiter/jobs", "Quản lý công việc"],
            ["/recruiter/candidates", "Xem & cập nhật hồ sơ"],
            ["/recruiter/candidates/screening", "Sàng lọc CV"],
            ["/recruiter/calendar", "Lịch phỏng vấn"],
            ["/recruiter/analytics", "Báo cáo tuyển dụng"],
            ["/recruiter/notifications", "Thông báo"],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="rounded-xl border border-slate-200 px-4 py-4 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50"
            >
              {label} →
            </Link>
          ))}
        </div>
      </Panel>
    </Workspace>
  )
}
