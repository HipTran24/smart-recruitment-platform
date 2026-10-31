import { apiClient } from "../lib/api"
import type { SystemSettings } from "../services/admin.service"
import { useResource } from "../hooks/useResource"
import { Workspace, Panel, ResourceState } from "../components/ui/Workspace"
export default function SettingsConfiguration() {
  const resource = useResource((signal) =>
    apiClient.get<SystemSettings>("/api/v1/admin/operations/settings", {
      signal,
    }),
  )
  return (
    <Workspace
      title="Cấu hình hệ thống"
      description="Thông số vận hành được quản lý bằng cấu hình máy chủ."
    >
      <ResourceState resource={resource} />
      {resource.data && (
        <Panel title="Thông số hiện tại">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <dt>Giới hạn CV</dt>
            <dd>10 MB · PDF và DOCX</dd>
            <dt>Nhà cung cấp sàng lọc</dt>
            <dd>Dịch vụ AI được cấu hình trên máy chủ</dd>
            <dt>Số tác vụ AI chạy đồng thời</dt>
            <dd>2</dd>
            <dt>Hàng đợi AI</dt>
            <dd>Tối đa 32 tác vụ</dd>
          </dl>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Đổi khóa API, mô hình và kết nối dữ liệu trong biến môi trường của
            backend rồi khởi động lại dịch vụ.
          </p>
        </Panel>
      )}
    </Workspace>
  )
}
