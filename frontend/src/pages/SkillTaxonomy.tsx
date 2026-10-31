import { useState } from "react"
import { adminService, type AdminSkillItem } from "../services/admin.service"
import { apiClient } from "../lib/api"
import { useResource } from "../hooks/useResource"
import {
  Workspace,
  Panel,
  Field,
  control,
  ResourceState,
  Notice,
  Empty,
} from "../components/ui/Workspace"
import { Button } from "../components/ui/Button"
export default function SkillTaxonomy() {
  const resource = useResource((signal) =>
    apiClient.get<AdminSkillItem[]>("/api/v1/admin/skills", { signal }),
  )
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  return (
    <Workspace
      title="Danh mục kỹ năng"
      description="Duy trì danh mục kỹ năng dùng trong hồ sơ và công việc."
    >
      <Notice text={error} error />
      <Panel>
        <form
          className="grid items-end gap-4 sm:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError("")
            try {
              await adminService.createSkill({ name, category })
              setName("")
              resource.reload()
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Không lưu được kỹ năng.",
              )
            } finally {
              setBusy(false)
            }
          }}
        >
          <Field label="Tên kỹ năng">
            <input
              className={control}
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Nhóm kỹ năng">
            <input
              className={control}
              maxLength={100}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Field>
          <Button disabled={busy} type="submit">
            Thêm kỹ năng
          </Button>
        </form>
      </Panel>
      <ResourceState resource={resource} />
      <Panel>
        {resource.data?.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] py-3"
          >
            <span>
              {s.name}
              <span className="ml-3 text-sm text-[var(--color-text-secondary)]">
                {s.category}
              </span>
            </span>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError("")
                try {
                  await adminService.deleteSkill(s.id)
                  resource.reload()
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Kỹ năng đang được sử dụng hoặc không thể xóa.",
                  )
                } finally {
                  setBusy(false)
                }
              }}
            >
              Xóa
            </Button>
          </div>
        ))}
        {resource.data?.length === 0 && <Empty />}
      </Panel>
    </Workspace>
  )
}
