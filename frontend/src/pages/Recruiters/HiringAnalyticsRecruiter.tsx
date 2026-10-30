import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { PageHeader } from "../../components/ui/PageHeader"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { PipelineChart } from "../../components/ui/PipelineChart"
import {
  recruiterPipelineService,
  type PipelineApplication,
} from "../../services/recruiter-pipeline.service"
import {
  cohort,
  reachedCounts,
  statusCounts,
  validDay,
} from "./analytics-model"

export default function HiringAnalyticsRecruiter() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState<PipelineApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [revision, refresh] = useState(0)
  const job = params.get("job") ?? ""
  const from = params.get("from") ?? ""
  const to = params.get("to") ?? ""
  const source = params.get("source") ?? ""
  const invalid =
    !validDay(from) ||
    !validDay(to) ||
    Boolean(from && to && from > to) ||
    Boolean(job && !/^[1-9]\d*$/.test(job)) ||
    Boolean(source)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setItems([])
    recruiterPipelineService
      .all(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setItems(data)
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Không tải được dữ liệu đầy đủ. Vui lòng thử lại.")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [revision])
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    setParams(next)
  }
  const jobs = useMemo(
    () => [
      ...new Map(items.map((item) => [item.jobId, item.jobTitle])).entries(),
    ],
    [items],
  )
  const selected = useMemo(
    () => (invalid ? [] : cohort(items, job, from, to)),
    [items, job, from, to, invalid],
  )
  const current = useMemo(() => statusCounts(selected), [selected])
  const reached = useMemo(() => reachedCounts(selected), [selected])
  const scored = selected.filter((item) => item.screeningScore !== null)
  const average = scored.length
    ? (
        scored.reduce((sum, item) => sum + item.screeningScore!, 0) /
        scored.length
      ).toFixed(1)
    : null
  return (
    <section className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Phân tích tuyển dụng"
        description="Báo cáo theo nhóm hồ sơ được nộp trong khoảng ngày đã chọn. Ngày được tính theo múi giờ thiết bị."
        actions={
          <Button onClick={() => refresh((value) => value + 1)}>
            Tải lại báo cáo
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Select
          label="Vị trí tuyển dụng"
          value={job}
          onChange={(event) => filter("job", event.target.value)}
          options={[
            { value: "", label: "Tất cả vị trí" },
            ...jobs.map(([id, label]) => ({ value: String(id), label })),
          ]}
        />
        <Input
          label="Từ ngày nộp"
          type="date"
          value={from}
          onChange={(event) => filter("from", event.target.value)}
        />
        <Input
          label="Đến ngày nộp"
          type="date"
          value={to}
          onChange={(event) => filter("to", event.target.value)}
        />
        <Select
          label="Nguồn ứng tuyển"
          value=""
          disabled
          options={[{ value: "", label: "Chưa khả dụng" }]}
          aria-describedby="source-note"
        />
      </div>
      <p id="source-note" className="text-sm text-slate-700">
        Lọc theo nguồn và biểu đồ phân bổ kỹ năng hiện chưa khả dụng.
      </p>
      {invalid ? (
        <div role="alert">
          <p>
            Bộ lọc không hợp lệ hoặc chưa được hỗ trợ. Kiểm tra khoảng ngày, Job
            ID và nguồn.
          </p>
          <Button onClick={() => setParams({})}>Xóa bộ lọc</Button>
        </div>
      ) : loading ? (
        <p role="status">Đang tải toàn bộ dữ liệu…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <Button onClick={() => refresh((value) => value + 1)}>Thử lại</Button>
        </div>
      ) : !selected.length ? (
        <p role="status">Không có hồ sơ trong khoảng đã chọn.</p>
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            aria-label="Chỉ số tuyển dụng"
          >
            {[
              ["Tổng hồ sơ", selected.length],
              ["Có điểm AI", scored.length],
              [
                "Điểm trung bình của hồ sơ có điểm",
                average === null ? "Chưa có điểm" : `${average}%`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="p-4 rounded-xl border border-slate-200 bg-white"
              >
                <p className="text-sm text-slate-700">{label}</p>
                <p className="text-2xl font-bold mt-2">{value}</p>
              </div>
            ))}
          </div>
          <section
            className="p-4 rounded-xl border border-slate-200 bg-white min-w-0"
            aria-labelledby="current-title"
          >
            <h2 id="current-title" className="text-lg font-semibold">
              Trạng thái hiện tại
            </h2>
            <PipelineChart counts={current} />
            <DataTable
              counts={current}
              total={selected.length}
              caption="Số hồ sơ theo trạng thái hiện tại"
            />
          </section>
          <section
            className="p-4 rounded-xl border border-slate-200 bg-white"
            aria-labelledby="funnel-title"
          >
            <h2 id="funnel-title" className="text-lg font-semibold">
              Các bước đã được ghi nhận
            </h2>
            <p className="text-sm text-slate-700 my-2">
              Đếm mỗi hồ sơ một lần cho từng bước xuất hiện trong lịch sử hoặc
              trạng thái hiện tại; không suy đoán bước còn thiếu và không coi
              đây là tỷ lệ tuyển thành công.
            </p>
            <DataTable
              counts={reached}
              total={selected.length}
              caption="Số hồ sơ từng có mặt ở mỗi bước"
            />
          </section>
        </>
      )}
    </section>
  )
}
function DataTable({
  counts,
  total,
  caption,
}: {
  counts: { status: string count: number }[]
  total: number
  caption: string
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left py-3 font-medium">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="p-2">
              Bước
            </th>
            <th scope="col" className="p-2">
              Số hồ sơ
            </th>
            <th scope="col" className="p-2">
              Tỷ lệ trong nhóm
            </th>
          </tr>
        </thead>
        <tbody>
          {counts.map((item) => (
            <tr key={item.status} className="border-t border-slate-200">
              <th scope="row" className="p-2">
                {item.status}
              </th>
              <td className="p-2">{item.count}</td>
              <td className="p-2">
                {total ? ((item.count / total) * 100).toFixed(1) : "0.0"}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
