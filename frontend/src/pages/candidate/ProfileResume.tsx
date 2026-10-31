import { useState, useEffect, useRef, type FormEvent } from "react"
import { useAuth } from "../../auth/AuthContext"
import {
  candidateService,
  type CandidateProfile,
} from "../../services/candidate.service"
import { apiClient } from "../../lib/api"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  Field,
  control,
  ResourceState,
  Notice,
  Empty,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"

export default function ProfileResume() {
  const { user } = useAuth()
  const profile = useResource((signal) =>
    apiClient.get<CandidateProfile>("/api/v1/candidates/me", { signal }),
  )
  const [form, setForm] = useState({
    phone: "",
    headline: "",
    city: "",
    bio: "",
  })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (profile.data)
      setForm({
        phone: profile.data.phone ?? "",
        headline: profile.data.headline ?? "",
        city: profile.data.city ?? "",
        bio: profile.data.bio ?? "",
      })
  }, [profile.data])
  async function mutate(action: () => Promise<unknown>, success: string) {
    if (busy) return
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await action()
      setMessage(success)
      profile.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được hồ sơ.")
    } finally {
      setBusy(false)
    }
  }
  async function upload(file?: File) {
    if (!file) return
    if (
      !/\.(pdf|docx)$/i.test(file.name) ||
      file.size === 0 ||
      file.size > 10 * 1024 * 1024
    ) {
      setError("Chọn file PDF hoặc DOCX có dung lượng tối đa 10 MB.")
      return
    }
    const body = new FormData()
    body.append("file", file)
    await mutate(
      () =>
        apiClient.post("/api/v1/candidates/me/resumes/upload", body, {
          timeoutMs: 60000,
        }),
      "Đã tải và đọc nội dung CV.",
    )
    if (fileInput.current) fileInput.current.value = ""
  }
  return (
    <Workspace
      title="My Profile & Resume"
      description="Quản lý hồ sơ, CV và quyền xử lý AI của bạn."
    >
      <Notice text={message} />
      <Notice text={error} error />
      <ResourceState resource={profile} />
      {profile.data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title={user?.fullName || "Hồ sơ ứng viên"}>
            <p className="break-all text-sm text-slate-600">{user?.email}</p>
            <form
              className="space-y-4"
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                void mutate(
                  () => candidateService.updateProfile(form),
                  "Đã lưu thông tin hồ sơ.",
                )
              }}
            >
              {(["headline", "phone", "city"] as const).map((key, index) => (
                <Field
                  key={key}
                  label={
                    ["Vị trí chuyên môn", "Số điện thoại", "Thành phố"][index]
                  }
                >
                  <input
                    className={control}
                    maxLength={key === "phone" ? 40 : 255}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </Field>
              ))}
              <Field label="Giới thiệu">
                <textarea
                  className={control}
                  rows={4}
                  maxLength={5000}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </Field>
              <Button type="submit" disabled={busy}>
                {busy ? "Đang lưu…" : "Save Changes"}
              </Button>
            </form>
          </Panel>
          <div className="space-y-6">
            <Panel title="CV của bạn">
              <label
                className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-8 text-center ${
                  busy
                    ? "pointer-events-none opacity-60"
                    : "hover:bg-emerald-50"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (!busy) void upload(e.dataTransfer.files[0])
                }}
              >
                <span className="text-3xl text-emerald-700" aria-hidden="true">
                  ↑
                </span>
                <span className="font-semibold">
                  {busy ? "Đang đọc và lưu CV…" : "Tải lên hoặc kéo thả CV"}
                </span>
                <span className="text-sm text-slate-600">
                  PDF / DOCX · tối đa 10 MB · cần có lớp văn bản
                </span>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.docx"
                  disabled={busy}
                  className="max-w-full text-sm"
                  onChange={(e) => void upload(e.target.files?.[0])}
                />
              </label>
              {profile.data.resumes.length === 0 && (
                <Empty text="Chưa có CV. Tải lên để bắt đầu ứng tuyển." />
              )}
              {profile.data.resumes.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold">
                      {r.originalFileName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {(r.fileSizeBytes / 1024).toFixed(0)} KB{" "}
                      {r.primaryResume ? "· CV mặc định" : ""}
                    </p>
                  </div>
                  {!r.primaryResume && (
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        void mutate(
                          () => candidateService.setPrimaryResume(r.id),
                          "Đã đổi CV mặc định.",
                        )
                      }
                    >
                      Đặt mặc định
                    </Button>
                  )}
                </div>
              ))}
            </Panel>
            <Panel title="Quyền riêng tư">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-emerald-600"
                  disabled={busy}
                  checked={profile.data.aiProcessingConsented}
                  onChange={(e) =>
                    void mutate(
                      () => candidateService.updateConsent(e.target.checked),
                      "Đã lưu quyền xử lý AI.",
                    )
                  }
                />
                <span>
                  Cho phép gửi nội dung CV đã lọc thông tin liên lạc đến dịch vụ AI
                  để hỗ trợ đối chiếu yêu cầu công việc. Nhà tuyển dụng xem xét
                  kết quả và quyết định cuối cùng.
                </span>
              </label>
            </Panel>
          </div>
        </div>
      )}
    </Workspace>
  )
}
