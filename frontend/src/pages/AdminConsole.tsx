import { Link } from "react-router-dom"
import { apiClient } from "../lib/api"
import { useResource } from "../hooks/useResource"
import { Workspace, Panel, ResourceState } from "../components/ui/Workspace"
export default function AdminConsole() {
  const resource = useResource((signal) =>
    apiClient.get<Record<string, number>>("/api/v1/admin/overview", { signal }),
  )
  return (
    <Workspace
      title="Platform Administration Console"
      description="Chỉ số tổng hợp của hệ thống và quản trị tài khoản."
    >
      <ResourceState resource={resource} />
      {resource.data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries({
            users: "Tổng tài khoản",
            activeUsers: "Tài khoản hoạt động",
            openJobs: "Công việc đang tuyển",
            applications: "Đơn ứng tuyển",
            completedScreenings: "Sàng lọc hoàn tất",
            failedScreenings: "Sàng lọc thất bại",
          }).map(([key, label]) => (
            <Panel key={key}>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {label}
              </p>
              <p className="text-4xl font-semibold">{resource.data![key]}</p>
            </Panel>
          ))}
        </div>
      )}
      <Panel title="Quản trị hệ thống">
        <div className="flex flex-wrap gap-4">
          {[
            ["/user-directory", "Tài khoản & phân quyền"],
            ["/skill-taxonomy", "Danh mục kỹ năng"],
            ["/audit", "Nhật ký hệ thống"],
          ].map(([url, label]) => (
            <Link
              key={url}
              to={url}
              className="text-sm font-medium text-[var(--color-brand-text)]"
            >
              {label} →
            </Link>
          ))}
        </div>
      </Panel>
    </Workspace>
  )
}
