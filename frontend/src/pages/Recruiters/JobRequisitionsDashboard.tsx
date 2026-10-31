import { useState } from "react"
import { Link } from "react-router-dom"
import { apiClient, type PageResponse } from "../../lib/api"
import { jobService, type JobSummary } from "../../services/job.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  control,
  ResourceState,
  Notice,
  Empty,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"

export default function JobRequisitionsDashboard() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState("")
  const jobs = useResource(
    (signal) =>
      apiClient.get<PageResponse<JobSummary>>("/api/v1/recruiter/jobs", {
        params: { page, size: 12, status },
        signal,
      }),
    [page, status],
  )
  async function change(id: number, publish: boolean) {
    setBusy(id)
    setError("")
    try {
      await (publish ? jobService.publishJob(id) : jobService.closeJob(id))
      jobs.reload()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không cập nhật được công việc.",
      )
    } finally {
      setBusy(null)
    }
  }
  return (
    <Workspace
      title="Job Requisitions"
      description="Các vị trí và trạng thái tuyển dụng của doanh nghiệp."
      actions={
        <Link
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          to="/recruiter/jobs/create"
        >
          Tạo công việc mới
        </Link>
      }
    >
      <select
        className={`${control} sm:max-w-xs`}
        aria-label="Trạng thái công việc"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value)
          setPage(0)
        }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="DRAFT">Bản nháp</option>
        <option value="OPEN">Đang tuyển</option>
        <option value="CLOSED">Đã đóng</option>
      </select>
      <Notice text={error} error />
      <ResourceState resource={jobs} />
      {jobs.data && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.data.items.map((job) => (
              <Panel key={job.id} title={job.title}>
                <p className="text-sm text-slate-600">
                  {job.companyName} · {job.location || "Chưa cập nhật"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                    {job.status}
                  </span>
                  <Link
                    className="text-sm text-blue-700"
                    to={`/recruiter/candidates?jobId=${job.id}`}
                  >
                    Xem hồ sơ
                  </Link>
                  {job.status === "DRAFT" && (
                    <Button
                      disabled={busy !== null}
                      onClick={() => void change(job.id, true)}
                    >
                      Đăng tuyển
                    </Button>
                  )}
                  {job.status === "OPEN" && (
                    <Button
                      variant="secondary"
                      disabled={busy !== null}
                      onClick={() => void change(job.id, false)}
                    >
                      Đóng tuyển dụng
                    </Button>
                  )}
                </div>
              </Panel>
            ))}
          </div>
          {!jobs.data.items.length && (
            <Empty text="Chưa có công việc trong danh sách này." />
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </Button>
            <span className="text-sm">
              {page + 1} / {Math.max(1, jobs.data.totalPages)}
            </span>
            <Button
              variant="secondary"
              disabled={page + 1 >= jobs.data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </Button>
          </div>
        </>
      )}
    </Workspace>
  )
}
