import { useState } from "react"
import { apiClient } from "../lib/api"
import type { AuditEventPageResponse } from "../services/admin.service"
import { useResource } from "../hooks/useResource"
import {
  Workspace,
  Panel,
  control,
  ResourceState,
  Empty,
  dateTime,
} from "../components/ui/Workspace"
import { Button } from "../components/ui/Button"
export default function AuditEventExplorer() {
  const [page, setPage] = useState(0)
  const [action, setAction] = useState("")
  const resource = useResource(
    (signal) =>
      apiClient.get<AuditEventPageResponse>("/api/v1/admin/audit-events", {
        params: { page, size: 25, action },
        signal,
      }),
    [page, action],
  )
  return (
    <Workspace
      title="Nhật ký hệ thống"
      description="Sự kiện kiểm toán đã được ghi nhận trên máy chủ."
    >
      <input
        className={`${control} max-w-sm`}
        aria-label="Lọc hành động"
        placeholder="Lọc theo hành động…"
        value={action}
        onChange={(e) => {
          setAction(e.target.value)
          setPage(0)
        }}
      />
      <ResourceState resource={resource} />
      <Panel>
        {resource.data?.items.map((e) => (
          <div
            key={e.id}
            className="space-y-1 border-b border-[var(--color-border)] py-4"
          >
            <h2 className="text-sm font-semibold">{e.action}</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {dateTime(e.createdAt)} · user #{e.actorUserId ?? "system"} ·{" "}
              {e.resourceType} #{e.resourceId}
            </p>
            <p className="break-all text-xs text-[var(--color-text-secondary)]">
              {e.metadataJson}
            </p>
          </div>
        ))}
        {resource.data?.items.length === 0 && <Empty />}
      </Panel>
      {resource.data && (
        <div className="flex justify-between">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </Button>
          <span>{resource.data.total} sự kiện</span>
          <Button
            variant="secondary"
            disabled={(page + 1) * 25 >= resource.data.total}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </Workspace>
  )
}
