import { useState } from "react"
import { Link } from "react-router-dom"
import {
  applicationStatusLabel,
  screeningStatusLabel,
  screeningFailureLabel,
} from "../../lib/recruitment-labels"
import { recruiterPipelineService } from "../../services/recruiter-pipeline.service"
import { workspaceService } from "../../services/workspace.service"
import { useResource } from "../../hooks/useResource"
import { useScreeningProgress } from "../../hooks/useScreeningProgress"
import {
  Workspace,
  Panel,
  ResourceState,
  Notice,
  Empty,
  dateTime,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"

export default function BulkCandidateScreeningHub() {
  const resource = useResource((signal) => recruiterPipelineService.all(signal))
  const items = resource.data ?? []
  const [selected, setSelected] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const progress = useScreeningProgress(items.map((item) => item.id))
  const { runs, setRuns } = progress
  const eligibleIds = items
    .filter((item) => !["REJECTED", "WITHDRAWN"].includes(item.status))
    .map((item) => item.id)
  const allSelected =
    eligibleIds.length > 0 && eligibleIds.every((id) => selected.includes(id))
  const completed = eligibleIds.filter(
    (id) => runs[id]?.status === "COMPLETED",
  ).length
  const waiting = eligibleIds.filter(
    (id) => runs[id]?.status === "WAITING_QUOTA",
  )
  const failed = eligibleIds.filter(
    (id) => runs[id]?.status === "FAILED",
  ).length
  const processing = eligibleIds.filter((id) =>
    ["PENDING", "PROCESSING", "RETRY_SCHEDULED"].includes(runs[id]?.status),
  ).length
  const ready = eligibleIds.length > 0 && eligibleIds.every((id) => runs[id])
  const nextAttempt = waiting
    .map((id) => runs[id].nextAttemptAt)
    .filter((time): time is string => !!time)
    .sort()[0]
  const percentage = eligibleIds.length
    ? Math.round((completed * 100) / eligibleIds.length)
    : 0
  const pageCount = Math.ceil(items.length / 50)

  async function start() {
    setBusy(true)
    setError("")
    const failures: number[] = []
    for (const id of selected.filter((id) => eligibleIds.includes(id))) {
      try {
        const result = await workspaceService.screen(id)
        setRuns((previous) => ({ ...previous, [id]: result }))
      } catch {
        failures.push(id)
      }
    }
    if (failures.length)
      setError(
        `Chưa tiếp nhận được ${failures.length} hồ sơ: ${failures.map((id) => `#${id}`).join(", ")}. Các hồ sơ này vẫn được chọn để bạn thử lại.`,
      )
    setSelected(failures)
    setBusy(false)
  }

  return (
    <Workspace
      title="Sàng lọc CV"
      description="Đối chiếu từng CV với yêu cầu công việc. Kết quả hỗ trợ nhà tuyển dụng xem xét."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={busy || eligibleIds.length === 0}
            onClick={() => setSelected(allSelected ? [] : eligibleIds)}
          >
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
          <Button
            disabled={busy || selected.length === 0}
            onClick={() => void start()}
          >
            {busy
              ? "Đang đưa vào hàng đợi…"
              : `Phân tích ${selected.length} hồ sơ`}
          </Button>
        </div>
      }
    >
      <ResourceState resource={resource} />
      <Notice text={error || progress.error} error />
      {ready && (
        <Panel
          title={`Đã hoàn tất ${completed}/${eligibleIds.length} hồ sơ (${percentage}%)`}
        >
          <progress
            className="h-3 w-full accent-blue-600"
            value={completed}
            max={eligibleIds.length}
            aria-label="Tiến độ sàng lọc CV"
          />
          <p className="text-sm text-slate-600" role="status">
            {processing} đang xử lý · {waiting.length} chờ hạn mức AI · {failed}{" "}
            gặp lỗi ·{" "}
            {
              eligibleIds.filter((id) => runs[id]?.status === "NOT_STARTED")
                .length
            }{" "}
            chưa phân tích
          </p>
          {waiting.length > 0 && (
            <p
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
              role="status"
            >
              {waiting.length} hồ sơ đang chờ hạn mức AI. Hệ thống đã lưu yêu
              cầu và sẽ tự chạy tiếp
              {nextAttempt ? ` từ ${dateTime(nextAttempt)}` : " khi có hạn mức"}{" "}
              khi máy chủ đang chạy.
            </p>
          )}
        </Panel>
      )}
      <Panel>
        <p className="text-sm text-slate-600">
          Chọn tất cả để sàng lọc toàn bộ hồ sơ đủ điều kiện, kể cả ở các trang
          khác. CV phải có nội dung đọc được và ứng viên phải đồng ý xử lý AI.
          Kết quả đã hoàn tất được dùng lại khi dữ liệu không thay đổi.
        </p>
        {items.length > eligibleIds.length && (
          <p className="text-sm text-slate-600">
            {items.length - eligibleIds.length} hồ sơ đã rút hoặc bị từ chối được hiển thị riêng và không thuộc đợt sàng lọc.
          </p>
        )}
        {items.slice(page * 50, (page + 1) * 50).map((application) => {
          const run = runs[application.id]
          return (
            <div
              key={application.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-0"
            >
              <label className="flex min-w-0 items-center gap-3">
                <input
                  type="checkbox"
                  disabled={
                    busy ||
                    ["REJECTED", "WITHDRAWN"].includes(application.status)
                  }
                  checked={selected.includes(application.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, application.id]
                        : selected.filter((id) => id !== application.id),
                    )
                  }
                />
                <span className="min-w-0">
                  <span className="block font-medium">
                    {application.candidateName}
                  </span>
                  <span className="text-sm text-slate-600">
                    {application.jobTitle}
                  </span>
                </span>
              </label>
              <div className="min-w-0 text-sm sm:max-w-md" role="status">
                <span>
                  {["REJECTED", "WITHDRAWN"].includes(application.status)
                    ? applicationStatusLabel(application.status)
                    : run
                    ? screeningStatusLabel(run.status)
                    : "Đang tải trạng thái…"}
                  {run?.status === "COMPLETED" && run.score != null
                    ? ` · ${run.score}%`
                    : ""}
                </span>
                {run?.failureCode && (
                  <p className="mt-1 text-xs text-amber-800">
                    {screeningFailureLabel(run.failureCode)}
                  </p>
                )}
              </div>
              <Link
                className="text-sm text-blue-700"
                to={`/recruiter/candidates/${application.id}`}
              >
                Chi tiết →
              </Link>
            </div>
          )
        })}
        {items.length === 0 && !resource.loading && !resource.error && (
          <Empty text="Chưa có hồ sơ để sàng lọc." />
        )}
        {pageCount > 1 && (
          <nav
            className="flex flex-wrap items-center justify-between gap-3"
            aria-label="Trang hồ sơ"
          >
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </Button>
            <span className="text-sm">
              Trang {page + 1}/{pageCount} · {items.length} hồ sơ
            </span>
            <Button
              variant="secondary"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </Button>
          </nav>
        )}
      </Panel>
    </Workspace>
  )
}
