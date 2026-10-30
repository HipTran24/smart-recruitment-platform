import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { PageHeader } from "../../components/ui/PageHeader"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { Modal } from "../../components/ui/Modal"
import {
  criteriaList,
  pipelineStatuses,
  recruiterPipelineService,
  type PipelineApplication,
} from "../../services/recruiter-pipeline.service"

export default function CandidateManagement() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState<PipelineApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [revision, refresh] = useState(0)
  const [selected, setSelected] = useState<PipelineApplication | null>(null)
  const [target, setTarget] = useState("IN_REVIEW")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("score")
  const page = Math.max(0, Number(params.get("page")) || 0)
  const rawJob = params.get("job") ?? ""
  const jobId = /^[1-9]\d*$/.test(rawJob) ? Number(rawJob) : undefined
  const status = params.get("status") ?? ""
  const invalidFilter = Boolean(
    (rawJob && (!jobId || !Number.isSafeInteger(jobId))) ||
      (status &&
        !pipelineStatuses.includes(
          status as typeof pipelineStatuses[number],
        )) ||
      !Number.isSafeInteger(page),
  )
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    if (key !== "page") next.delete("page")
    setParams(next)
  }
  useEffect(() => {
    const controller = new AbortController()
    setItems([])
    setError("")
    setLoading(true)
    if (invalidFilter) {
      setError("Bộ lọc không hợp lệ. Hãy kiểm tra Job ID và trạng thái.")
      setLoading(false)
      return
    }
    recruiterPipelineService
      .all(controller.signal, { jobId, status: status || undefined })
      .then((result) => {
        if (!controller.signal.aborted) setItems(result)
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Không tải được hồ sơ. Vui lòng thử lại.")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [jobId, status, revision, invalidFilter])
  const ranked = useMemo(
    () =>
      items
        .filter((item) =>
          `${item.candidateName} ${item.candidateEmail} ${item.jobTitle}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "score"
            ? (b.screeningScore ?? -1) - (a.screeningScore ?? -1) || a.id - b.id
            : Date.parse(b.createdAt) - Date.parse(a.createdAt),
        ),
    [items, search, sort],
  )
  const total = ranked.length
  const pages = Math.ceil(total / 20)
  const visible = ranked.slice(page * 20, (page + 1) * 20)
  async function save() {
    if (!selected || saving) return
    setSaving(true)
    setSaveError("")
    try {
      const updated = await recruiterPipelineService.transition(
        selected.id,
        target,
        note.trim(),
      )
      if (updated.id !== selected.id || updated.status !== target)
        throw new Error("Unexpected transition response")
      setSelected(null)
      setNotice("Đã cập nhật trạng thái hồ sơ.")
      refresh((value) => value + 1)
    } catch {
      setSaveError(
        "Chưa xác nhận được cập nhật. Kiểm tra lại danh sách trước khi thử lại.",
      )
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Xếp hạng ứng viên"
        description="Điểm và trạng thái được đọc từ hồ sơ ứng tuyển. Quyết định tuyển dụng luôn do người phụ trách xét duyệt."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Input
          label="Job ID"
          type="number"
          min="1"
          value={rawJob}
          onChange={(event) => filter("job", event.target.value)}
        />
        <Select
          label="Trạng thái hồ sơ"
          value={status}
          onChange={(event) => filter("status", event.target.value)}
          options={[
            { value: "", label: "Tất cả" },
            ...pipelineStatuses.map((value) => ({ value, label: value })),
          ]}
        />
        <Input
          label="Tìm ứng viên"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            filter("page", "")
          }}
        />
        <Select
          label="Sắp xếp"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
            filter("page", "")
          }}
          options={[
            { value: "score", label: "Điểm giảm dần" },
            { value: "date", label: "Mới nhất" },
          ]}
        />
      </div>
      <p className="text-sm text-slate-700">
        Hồ sơ chưa có điểm được hiển thị riêng, không tính là 0. Trạng thái xử
        lý AI chi tiết hiện chưa khả dụng.
      </p>
      {notice && (
        <p role="status" className="text-emerald-800">
          {notice}
        </p>
      )}
      {loading ? (
        <p role="status">Đang tải hồ sơ…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <Button onClick={() => refresh((value) => value + 1)}>Thử lại</Button>
        </div>
      ) : (
        <>
          <p role="status" className="text-sm text-slate-700">
            {total} hồ sơ · trang {page + 1}/{Math.max(1, pages)}
          </p>
          {!visible.length ? (
            <p>Không có hồ sơ phù hợp.</p>
          ) : (
            <div
              className="overflow-x-auto rounded-xl border border-slate-200 bg-white"
              tabIndex={0}
              role="region"
              aria-label="Danh sách ứng viên có thể cuộn ngang"
            >
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">
                  Xếp hạng hồ sơ trên trang hiện tại
                </caption>
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Ứng viên",
                      "Vị trí",
                      "Điểm AI",
                      "Trạng thái",
                      "Tiêu chí phù hợp",
                      "Thao tác",
                    ].map((title) => (
                      <th key={title} scope="col" className="p-3">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <th scope="row" className="p-3 font-medium">
                        <span className="block">{item.candidateName}</span>
                        <span className="block text-xs text-slate-600 break-all">
                          {item.candidateEmail}
                        </span>
                      </th>
                      <td className="p-3">{item.jobTitle}</td>
                      <td className="p-3">
                        {item.screeningScore == null
                          ? "Chưa có điểm"
                          : `${item.screeningScore}%`}
                      </td>
                      <td className="p-3">{item.status}</td>
                      <td className="p-3">
                        {criteriaList(item.matchedCriteria).join(", ") ||
                          "Chưa có dữ liệu"}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelected(item)
                            setTarget(item.status)
                            setNote("")
                            setSaveError("")
                          }}
                        >
                          Xem / cập nhật
                          <span className="sr-only"> {item.candidateName}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <nav
            aria-label="Phân trang ứng viên"
            className="flex flex-wrap gap-3"
          >
            <Button
              disabled={page === 0}
              onClick={() => filter("page", String(page - 1))}
            >
              Trang trước
            </Button>
            <Button
              disabled={page + 1 >= pages}
              onClick={() => filter("page", String(page + 1))}
            >
              Trang sau
            </Button>
            <Button
              variant="secondary"
              onClick={() => refresh((value) => value + 1)}
            >
              Tải lại
            </Button>
          </nav>
        </>
      )}
      <Modal
        open={selected !== null}
        onClose={() => {
          if (!saving) setSelected(null)
        }}
        title={selected ? `Hồ sơ: ${selected.candidateName}` : "Hồ sơ ứng viên"}
      >
        {selected && (
          <div className="space-y-4">
            <p>{selected.screeningSummary || "Chưa có kết quả phân tích."}</p>
            <p>Khuyến nghị: {selected.screeningRecommendation || "Chưa có"}</p>
            <p>
              Tiêu chí còn thiếu:{" "}
              {criteriaList(selected.missingCriteria).join(", ") ||
                "Chưa có dữ liệu"}
            </p>
            <Select
              label="Trạng thái mới"
              value={target}
              disabled={saving}
              onChange={(event) => setTarget(event.target.value)}
              options={pipelineStatuses.map((value) => ({
                value,
                label: value,
              }))}
            />
            <Input
              label="Ghi chú thay đổi"
              value={note}
              disabled={saving}
              onChange={(event) => setNote(event.target.value)}
            />
            {saveError && <p role="alert">{saveError}</p>}
            <Button
              disabled={saving || target === selected.status}
              onClick={save}
            >
              {saving ? "Đang cập nhật…" : "Lưu trạng thái"}
            </Button>
          </div>
        )}
      </Modal>
    </section>
  )
}
