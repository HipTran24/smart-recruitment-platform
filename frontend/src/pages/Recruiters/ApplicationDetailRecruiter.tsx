import {
  applicationStatusLabel,
  screeningStatusLabel,
  recommendationLabel,
  screeningFailureLabel,
} from "../../lib/recruitment-labels"
import { useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { workspaceService } from "../../services/workspace.service"
import {
  recruiterPipelineService,
  criteriaList,
} from "../../services/recruiter-pipeline.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  Field,
  control,
  ResourceState,
  Notice,
  dateTime,
  Empty,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"

export default function ApplicationDetailDossier() {
  const { applicationId } = useParams()
  const [params, setParams] = useSearchParams()
  const id = applicationId ?? params.get("applicationId") ?? ""
  const list = useResource(
    (signal) =>
      !id
        ? recruiterPipelineService.list({ size: 100 }, signal)
        : Promise.resolve(null),
    [id],
  )
  const resource = useResource(
    async (signal) => {
      if (!id) return null
      const [application, evaluations, screening] = await Promise.all([
        workspaceService.application(id, signal),
        workspaceService.evaluations(id, signal),
        workspaceService.screening(Number(id), signal),
      ])
      return { application, evaluations, screening }
    },
    [id],
  )
  const [action, setAction] = useState("evaluation")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [score, setScore] = useState(50)
  const [recommendation, setRecommendation] = useState("NEUTRAL")
  const [notes, setNotes] = useState("")
  const [title, setTitle] = useState("Phỏng vấn chuyên môn")
  const [scheduledAt, setScheduledAt] = useState("")
  const [meeting, setMeeting] = useState("")
  const [salary, setSalary] = useState("")
  const [startDate, setStartDate] = useState("")
  const [deadline, setDeadline] = useState("")
  async function run(work: () => Promise<unknown>, success: string) {
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await work()
      setMessage(success)
      resource.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được thay đổi.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <Workspace
      title="Hồ sơ ứng viên"
      description="Xem bằng chứng, đánh giá và thực hiện bước tiếp theo trong quy trình tuyển dụng."
    >
      <Notice text={error} error />
      <Notice text={message} />
      <ResourceState resource={id ? resource : list} />
      {!id && list.data && (
        <Panel title="Chọn hồ sơ">
          <select
            className={control}
            aria-label="Chọn hồ sơ"
            value=""
            onChange={(e) => setParams({ applicationId: e.target.value })}
          >
            <option value="">Chọn ứng viên…</option>
            {list.data.items.map((a) => (
              <option key={a.id} value={a.id}>
                {a.candidateName} · {a.jobTitle}
              </option>
            ))}
          </select>
          {!list.data.items.length && <Empty text="Chưa có hồ sơ." />}
        </Panel>
      )}
      {resource.data && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <Panel title={resource.data.application.candidateName}>
              <p className="break-all text-sm">
                {resource.data.application.candidateEmail}
              </p>
              <p>{resource.data.application.jobTitle}</p>
              <p className="text-sm text-slate-600">
                {applicationStatusLabel(resource.data.application.status)} ·{" "}
                {dateTime(resource.data.application.createdAt)}
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {resource.data.application.coverLetter}
              </p>
            </Panel>
            <Panel title="Kết quả đối chiếu CV">
              <p className="text-3xl font-semibold">
                {resource.data.application.screeningScore == null
                  ? "Chưa có điểm"
                  : `${resource.data.application.screeningScore}%`}
              </p>
              <p className="text-sm">
                {resource.data.application.screeningSummary ||
                  "Chưa có kết quả phân tích."}
              </p>
              <p className="text-sm">
                Phù hợp:{" "}
                {criteriaList(resource.data.application.matchedCriteria).join(
                  ", ",
                ) || "—"}
              </p>
              <p className="text-sm">
                Cần kiểm chứng:{" "}
                {criteriaList(resource.data.application.missingCriteria).join(
                  ", ",
                ) || "—"}
              </p>
              <p className="text-sm">
                Trạng thái:{" "}
                {screeningStatusLabel(resource.data.screening.status)}{" "}
                {screeningFailureLabel(resource.data.screening.failureCode)}
              </p>
              {resource.data.screening.nextAttemptAt && (
                <p className="text-sm text-amber-800">
                  Tự thử lại từ {dateTime(resource.data.screening.nextAttemptAt)} khi máy chủ đang chạy.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || ["REJECTED", "WITHDRAWN"].includes(resource.data.application.status)}
                  onClick={() =>
                    void run(
                      () => workspaceService.screen(Number(id)),
                      "Đã tiếp nhận yêu cầu phân tích. Bấm cập nhật để kiểm tra kết quả.",
                    )
                  }
                >
                  Sàng lọc CV
                </Button>
                <Button variant="secondary" onClick={resource.reload}>
                  Cập nhật kết quả
                </Button>
              </div>
            </Panel>
            <Panel title="Đánh giá đã lưu">
              {resource.data.evaluations.map((e) => (
                <div
                  key={e.id}
                  className="border-b border-slate-100 py-3 last:border-0"
                >
                  <p className="font-semibold">
                    {e.score}/100 · {recommendationLabel(e.recommendation)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">
                    {e.technicalNotes}
                  </p>
                </div>
              ))}
              {!resource.data.evaluations.length && (
                <Empty text="Chưa có đánh giá." />
              )}
            </Panel>
          </div>
          <Panel title="Thao tác tuyển dụng">
            <Field label="Chọn thao tác">
              <select
                className={control}
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="evaluation">Lưu đánh giá</option>
                <option value="interview">Lên lịch phỏng vấn</option>
                <option value="offer">Gửi đề nghị tuyển dụng</option>
                <option value="feedback">Lưu bản nháp phản hồi</option>
              </select>
            </Field>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (action === "evaluation")
                  void run(
                    () =>
                      workspaceService.evaluate(
                        id,
                        score,
                        recommendation,
                        notes,
                      ),
                    "Đã lưu đánh giá.",
                  )
                if (action === "interview")
                  void run(
                    () =>
                      workspaceService.schedule(id, {
                        title,
                        scheduledAt: new Date(scheduledAt).toISOString(),
                        durationMinutes: 45,
                        locationOrUrl: meeting,
                      }),
                    "Đã lên lịch phỏng vấn.",
                  )
                if (action === "offer")
                  void run(
                    () =>
                      workspaceService.issueOffer(id, {
                        salaryOffered: Number(salary),
                        salaryCurrency: "VND",
                        startDate,
                        deadline: new Date(deadline).toISOString(),
                      }),
                    "Đã gửi đề nghị vào tài khoản ứng viên.",
                  )
                if (action === "feedback")
                  void run(
                    () => workspaceService.saveFeedback(id, notes),
                    "Đã lưu bản nháp phản hồi.",
                  )
              }}
            >
              {action === "evaluation" && (
                <>
                  <Field label="Điểm đánh giá">
                    <input
                      className={control}
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Khuyến nghị của người đánh giá">
                    <select
                      className={control}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                    >
                      {["STRONG_YES", "YES", "NEUTRAL", "NO", "STRONG_NO"].map(
                        (r) => (
                          <option key={r} value={r}>
                            {recommendationLabel(r)}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                </>
              )}
              {action === "interview" && (
                <>
                  <Field label="Tiêu đề phỏng vấn">
                    <input
                      className={control}
                      required
                      maxLength={255}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Field>
                  <Field label="Thời gian (giờ địa phương)">
                    <input
                      className={control}
                      type="datetime-local"
                      required
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </Field>
                  <Field label="Địa điểm hoặc URL cuộc họp">
                    <input
                      className={control}
                      value={meeting}
                      onChange={(e) => setMeeting(e.target.value)}
                    />
                  </Field>
                </>
              )}
              {action === "offer" && (
                <>
                  <Field label="Mức lương đề nghị (VND)">
                    <input
                      className={control}
                      type="number"
                      min={1}
                      required
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </Field>
                  <Field label="Ngày bắt đầu">
                    <input
                      className={control}
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Field>
                  <Field label="Hạn phản hồi (giờ địa phương)">
                    <input
                      className={control}
                      type="datetime-local"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </Field>
                  <p className="text-sm text-slate-600">
                    Gửi sẽ tạo đề nghị hiển thị ngay trong tài khoản ứng viên.
                  </p>
                </>
              )}
              {(action === "evaluation" || action === "feedback") && (
                <Field
                  label={
                    action === "feedback"
                      ? "Nội dung phản hồi"
                      : "Nhận xét chuyên môn"
                  }
                >
                  <textarea
                    className={control}
                    required
                    rows={8}
                    maxLength={10000}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Field>
              )}
              <Button type="submit" disabled={busy}>
                {busy
                  ? "Đang lưu…"
                  : action === "offer"
                    ? "Gửi đề nghị"
                    : "Lưu thay đổi"}
              </Button>
            </form>
          </Panel>
        </div>
      )}
    </Workspace>
  )
}
