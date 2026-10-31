import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { apiClient, type PageResponse } from "../../lib/api"
import type { JobSummary } from "../../services/job.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  Field,
  control,
  ResourceState,
  Empty,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"

export default function ExploreJobs() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get("query") ?? "")
  const query = params.get("query") ?? ""
  const page = Math.max(0, Number(params.get("page")) || 0)
  const workplace = params.get("workplaceType") ?? ""
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== query)
        setParams(
          (p) => {
            p.set("query", search)
            p.delete("page")
            return p
          },
          { replace: true },
        )
    }, 300)
    return () => clearTimeout(timer)
  }, [search, query, setParams])
  const jobs = useResource(
    (signal) =>
      apiClient.get<PageResponse<JobSummary>>("/api/v1/jobs", {
        auth: false,
        params: { query, page, size: 12, workplaceType: workplace },
        signal,
      }),
    [query, page, workplace],
  )
  return (
    <Workspace
      title="Explore Career Opportunities"
      description="Tìm công việc phù hợp và ứng tuyển bằng CV của bạn."
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Field label="Tìm kiếm công việc">
          <input
            className={control}
            placeholder="Tên vị trí, công ty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
        <Field label="Hình thức làm việc">
          <select
            className={control}
            value={workplace}
            onChange={(e) =>
              setParams((p) => {
                p.set("workplaceType", e.target.value)
                p.delete("page")
                return p
              })
            }
          >
            <option value="">Tất cả</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">Tại văn phòng</option>
          </select>
        </Field>
      </div>
      <ResourceState resource={jobs} />
      {jobs.data && (
        <>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {jobs.data.totalElements} vị trí đang tuyển
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.data.items.map((job) => (
              <Panel key={job.id}>
                <div className="flex h-full flex-col gap-4">
                  <p className="text-sm font-medium text-[var(--color-brand-text)]">
                    {job.companyName}
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight">
                    <Link
                      className="hover:text-[var(--color-brand-text)]"
                      to={`/jobs/${job.id}`}
                    >
                      {job.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {job.location || "Chưa cập nhật"} · {job.workplaceType}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {job.salaryMin != null
                      ? `${job.salaryMin.toLocaleString("vi-VN")} – ${job.salaryMax?.toLocaleString("vi-VN") ?? "…"} ${job.salaryCurrency ?? "VND"}`
                      : "Lương thỏa thuận"}
                  </p>
                  <Link
                    className="mt-auto rounded-lg bg-emerald-50 px-4 py-2 text-center text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                    to={`/jobs/${job.id}`}
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </Panel>
            ))}
          </div>
          {!jobs.data.items.length && (
            <Empty text="Không có công việc phù hợp với bộ lọc." />
          )}
          <nav
            aria-label="Phân trang công việc"
            className="flex items-center justify-between gap-3"
          >
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() =>
                setParams((p) => {
                  p.set("page", String(page - 1))
                  return p
                })
              }
            >
              Trang trước
            </Button>
            <span className="text-sm">
              {page + 1} / {Math.max(1, jobs.data.totalPages)}
            </span>
            <Button
              variant="secondary"
              disabled={page + 1 >= jobs.data.totalPages}
              onClick={() =>
                setParams((p) => {
                  p.set("page", String(page + 1))
                  return p
                })
              }
            >
              Trang sau
            </Button>
          </nav>
        </>
      )}
    </Workspace>
  )
}
