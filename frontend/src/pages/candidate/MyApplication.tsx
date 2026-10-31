import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"
import { workspaceService } from "../../services/workspace.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  ResourceState,
  Notice,
  Empty,
  dateTime,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"

export function MyApplication() {
  const { user } = useAuth()
  const { applicationId } = useParams()
  const resource = useResource(workspaceService.myApplications)
  const [selected, setSelected] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function withdraw() {
    if (!selected) return
    setBusy(true)
    setError("")
    try {
      await workspaceService.withdraw(selected)
      setSelected(null)
      resource.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không rút được hồ sơ.")
    } finally {
      setBusy(false)
    }
  }
  const items = resource.data?.filter(
    (a) => !applicationId || a.id === Number(applicationId),
  )
  return (
    <Workspace
      title={`Welcome back, ${user?.fullName?.split(" ")[0] ?? "bạn"}`}
      description="Theo dõi tiến trình tuyển dụng từ dữ liệu được cập nhật trên hệ thống."
      actions={
        <Link
          to="/explore-jobs"
          className="text-sm font-semibold text-emerald-700"
        >
          Tìm công việc →
        </Link>
      }
    >
      <ResourceState resource={resource} />
      <Notice text={error} error />
      {items?.map((a) => (
        <Panel key={a.id}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                <Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link>
              </h2>
              <p className="text-sm text-slate-600">
                Nộp ngày {dateTime(a.createdAt)}
              </p>
              <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                {a.status}
              </span>
            </div>
            {!["REJECTED", "WITHDRAWN", "OFFERED"].includes(a.status) && (
              <Button variant="secondary" onClick={() => setSelected(a.id)}>
                Rút hồ sơ
              </Button>
            )}
          </div>
          <ol className="space-y-2 border-l-2 border-emerald-100 pl-4 text-sm text-slate-600">
            {a.histories.map((h, i) => (
              <li key={i}>
                {h.toStatus} · {dateTime(h.createdAt)}
              </li>
            ))}
          </ol>
        </Panel>
      ))}
      {items?.length === 0 && (
        <Empty text="Chưa có đơn ứng tuyển. Khám phá công việc để bắt đầu." />
      )}
      <Modal
        open={selected !== null}
        onClose={() => {
          if (!busy) setSelected(null)
        }}
        title="Rút đơn ứng tuyển"
      >
        <p className="mb-4 text-sm">Xác nhận rút hồ sơ khỏi vị trí này?</p>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => void withdraw()}
        >
          {busy ? "Đang xử lý…" : "Xác nhận rút"}
        </Button>
      </Modal>
    </Workspace>
  )
}
