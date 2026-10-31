import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"
import { apiClient } from "../../lib/api"
import type { JobDetail } from "../../services/job.service"
import type { ResumeItem } from "../../services/candidate.service"
import { workspaceService } from "../../services/workspace.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  Field,
  control,
  ResourceState,
  Notice,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"

export default function ViewDetails() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const job = useResource(
    (signal) =>
      jobId
        ? apiClient.get<JobDetail>(`/api/v1/jobs/${jobId}`, {
            auth: false,
            signal,
          })
        : Promise.resolve(null),
    [jobId],
  )
  const resumes = useResource(
    (signal) =>
      user?.roleCodes.includes("ROLE_CANDIDATE")
        ? apiClient.get<ResumeItem[]>("/api/v1/candidates/me/resumes", {
            signal,
          })
        : Promise.resolve([]),
    [user?.id],
  )
  const [resume, setResume] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  async function apply() {
    if (!jobId) return
    const selected = Number(
      resume ||
        resumes.data?.find((r) => r.primaryResume)?.id ||
        resumes.data?.[0]?.id,
    )
    if (!selected) {
      setError("Hãy tải lên CV trước khi ứng tuyển.")
      return
    }
    setBusy(true)
    setError("")
    try {
      await workspaceService.apply(jobId, selected, note)
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không nộp được hồ sơ.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <Workspace
      title={job.data?.title ?? "Chi tiết công việc"}
      description={job.data?.companyName}
    >
      <Link className="text-sm text-emerald-700" to="/explore-jobs">
        ← Khám phá công việc
      </Link>
      <ResourceState resource={job} />
      {!jobId && (
        <Panel>
          <p>Chọn một công việc để xem chi tiết.</p>
          <Link to="/explore-jobs">Xem danh sách công việc</Link>
        </Panel>
      )}
      {job.data && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <Panel title="Mô tả công việc">
              <p className="text-sm text-slate-600">
                {job.data.location} · {job.data.workplaceType} ·{" "}
                {job.data.employmentType}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-7">
                {job.data.description}
              </p>
            </Panel>
            <Panel title="Yêu cầu">
              <p className="whitespace-pre-wrap text-sm leading-7">
                {job.data.requirements ||
                  "Liên hệ nhà tuyển dụng để biết thêm chi tiết."}
              </p>
            </Panel>
          </div>
          <Panel title="Ứng tuyển">
            <Notice text={error} error />
            {success ? (
              <>
                <Notice text="Đã nộp hồ sơ thành công." />
                <Link
                  to="/my-applications"
                  className="text-sm text-emerald-700"
                >
                  Theo dõi đơn ứng tuyển →
                </Link>
              </>
            ) : !user ? (
              <Link
                className="text-emerald-700"
                to="/login"
                state={{ from: `/jobs/${jobId}` }}
              >
                Đăng nhập để ứng tuyển
              </Link>
            ) : user.roleCodes.includes("ROLE_CANDIDATE") ? (
              <>
                <ResourceState resource={resumes} />
                <Field label="Chọn CV">
                  <select
                    className={control}
                    value={
                      resume ||
                      String(
                        resumes.data?.find((r) => r.primaryResume)?.id ??
                          resumes.data?.[0]?.id ??
                          "",
                      )
                    }
                    onChange={(e) => setResume(e.target.value)}
                  >
                    {!resumes.data?.length && (
                      <option value="">Chưa có CV</option>
                    )}
                    {resumes.data?.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.originalFileName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Link to="/profile-resume" className="text-sm text-emerald-700">
                  Quản lý / tải lên CV
                </Link>
                <Field label="Thư giới thiệu">
                  <textarea
                    className={control}
                    maxLength={10000}
                    rows={6}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
                <Button
                  disabled={
                    busy || !resumes.data?.length || job.data.status !== "OPEN"
                  }
                  onClick={() => void apply()}
                >
                  {busy ? "Đang nộp…" : "Nộp hồ sơ"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Ứng tuyển bằng tài khoản ứng viên.
              </p>
            )}
          </Panel>
        </div>
      )}
    </Workspace>
  )
}
