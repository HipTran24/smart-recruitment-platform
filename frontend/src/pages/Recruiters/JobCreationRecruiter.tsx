import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { jobService } from "../../services/job.service"
import {
  Workspace,
  Panel,
  Field,
  control,
  Notice,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"

export default function JobCreationStudio() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [location, setLocation] = useState("")
  const [workplace, setWorkplace] = useState("ONSITE")
  const [employment, setEmployment] = useState("FULL_TIME")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)
  async function publish(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      // Keep a successfully created draft if publishing fails; retry must not create a duplicate.
      let id = created
      if (!id) {
        const job = await jobService.createJob({
          companyId: 0,
          title: title.trim(),
          description: description.trim(),
          requirements: requirements.trim(),
          employmentType: employment,
          workplaceType: workplace,
          location,
        })
        id = job.id
        setCreated(id)
      }
      await jobService.publishJob(id)
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không đăng được công việc.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <Workspace
      title="Job Creation Studio"
      description="Mô tả công việc và tiêu chí cụ thể giúp đối chiếu CV chính xác hơn."
    >
      <Notice text={error} error />
      {success ? (
        <Panel title="Đã đăng tuyển thành công">
          <Link className="text-blue-700" to="/recruiter/jobs">
            Xem danh sách công việc →
          </Link>
        </Panel>
      ) : (
        <Panel>
          <form onSubmit={publish} className="grid gap-5 sm:grid-cols-2">
            <Field label="Job Title *">
              <input
                type="text"
                className={control}
                required
                maxLength={255}
                value={title}
                disabled={!!created}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="Địa điểm">
              <input
                className={control}
                maxLength={255}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!!created}
              />
            </Field>
            <Field label="Loại hợp đồng">
              <select
                className={control}
                value={employment}
                onChange={(e) => setEmployment(e.target.value)}
                disabled={!!created}
              >
                <option value="FULL_TIME">Toàn thời gian</option>
                <option value="PART_TIME">Bán thời gian</option>
                <option value="CONTRACT">Hợp đồng</option>
                <option value="INTERNSHIP">Thực tập</option>
              </select>
            </Field>
            <Field label="Hình thức làm việc">
              <select
                className={control}
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                disabled={!!created}
              >
                <option value="ONSITE">Tại văn phòng</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Mô tả công việc *">
                <textarea
                  className={control}
                  required
                  rows={5}
                  maxLength={24000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!!created}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Yêu cầu bắt buộc (mỗi dòng một tiêu chí) *">
                <textarea
                  className={control}
                  required
                  rows={5}
                  maxLength={10000}
                  placeholder="Java và Spring Boot&#10;SQL và thiết kế cơ sở dữ liệu"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  disabled={!!created}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Đang đăng tuyển…" : "Publish Job"}
              </Button>
            </div>
          </form>
        </Panel>
      )}
    </Workspace>
  )
}
