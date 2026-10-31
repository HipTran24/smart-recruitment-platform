import { useState } from "react"
import { useLocation } from "react-router-dom"
import { apiClient } from "../lib/api"
import { adminService, type UserPageResponse } from "../services/admin.service"
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
import { Modal } from "../components/ui/Modal"
export default function UserDirectory() {
  const location = useLocation()
  const candidateOnly = location.pathname === "/candidates"
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState("")
  const [search, setSearch] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [selected, setSelected] =
    useState<UserPageResponse["items"][number] | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const resource = useResource(
    (signal) =>
      apiClient.get<UserPageResponse>("/api/v1/admin/users", {
        params: {
          page,
          size: 20,
          keyword: search,
          role: candidateOnly ? "ROLE_CANDIDATE" : "",
        },
        signal,
      }),
    [page, search, candidateOnly],
  )
  async function save() {
    if (!selected) return
    setBusy(true)
    setError("")
    try {
      await adminService.updateUserRoles(selected.id, roles)
      setSelected(null)
      resource.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không cập nhật được quyền.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <Workspace
      title={candidateOnly ? "Tài khoản ứng viên" : "Tài khoản & phân quyền"}
      description="Quản lý tài khoản, trạng thái và quyền truy cập."
    >
      <Notice text={error} error />
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(query)
          setPage(0)
        }}
      >
        <input
          className={control}
          aria-label="Tìm tài khoản"
          placeholder="Tìm theo email hoặc tên…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">Tìm</Button>
      </form>
      <ResourceState resource={resource} />
      {resource.data && (
        <>
          <Panel>
            {resource.data.items.map((u) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] py-4 last:border-0"
                key={u.id}
              >
                <div className="min-w-0">
                  <h2 className="font-semibold">{u.fullName}</h2>
                  <p className="break-all text-sm text-[var(--color-text-secondary)]">
                    {u.email}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {u.roles.join(", ")} · {u.active ? "Hoạt động" : "Đã khóa"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setSelected(u)
                      setRoles(u.roles)
                    }}
                  >
                    Phân quyền
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      setError("")
                      try {
                        await adminService.updateUserStatus(u.id, !u.active)
                        resource.reload()
                      } catch (e) {
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Không cập nhật được trạng thái.",
                        )
                      } finally {
                        setBusy(false)
                      }
                    }}
                  >
                    {u.active ? "Khóa tài khoản" : "Mở khóa"}
                  </Button>
                </div>
              </div>
            ))}
            {!resource.data.items.length && <Empty />}
          </Panel>
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </Button>
            <span className="text-sm">{resource.data.total} tài khoản</span>
            <Button
              variant="secondary"
              disabled={(page + 1) * 20 >= resource.data.total}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </Button>
          </div>
        </>
      )}
      <Modal
        open={!!selected}
        onClose={() => {
          if (!busy) setSelected(null)
        }}
        title="Phân quyền tài khoản"
      >
        <div className="space-y-4">
          {["ROLE_CANDIDATE", "ROLE_RECRUITER", "ROLE_PLATFORM_ADMIN"].map(
            (role) => (
              <label className="flex gap-3 text-sm" key={role}>
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={(e) =>
                    setRoles(
                      e.target.checked
                        ? [...roles, role]
                        : roles.filter((r) => r !== role),
                    )
                  }
                />
                {role}
              </label>
            ),
          )}
          <Button
            disabled={busy || roles.length === 0}
            onClick={() => void save()}
          >
            Lưu quyền
          </Button>
        </div>
      </Modal>
    </Workspace>
  )
}
