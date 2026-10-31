import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authService } from "../../services/auth.service"
import { tokenStore } from "../../auth/token-store"
import {
  Workspace,
  Panel,
  Field,
  control,
  Notice,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"
export function CandidateSettings({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [current, setCurrent] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <Workspace
      title="Cài đặt tài khoản"
      description="Quản lý bảo mật và hồ sơ của bạn."
      actions={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <Notice text={error} error />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Đổi mật khẩu">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              if (password !== confirm) {
                setError("Mật khẩu xác nhận chưa khớp.")
                return
              }
              setBusy(true)
              setError("")
              try {
                await authService.changePassword({
                  currentPassword: current,
                  newPassword: password,
                })
                tokenStore.clear()
                navigate("/login", { replace: true })
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Không đổi được mật khẩu.",
                )
              } finally {
                setBusy(false)
              }
            }}
          >
            <Field label="Mật khẩu hiện tại">
              <input
                className={control}
                type="password"
                autoComplete="current-password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field label="Mật khẩu mới">
              <input
                className={control}
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Xác nhận mật khẩu">
              <input
                className={control}
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <p className="text-sm text-slate-600">
              Sau khi đổi mật khẩu, đăng nhập lại để tiếp tục.
            </p>
            <Button disabled={busy} type="submit">
              {busy ? "Đang lưu…" : "Đổi mật khẩu"}
            </Button>
          </form>
        </Panel>
        <Panel title="Hồ sơ & quyền xử lý AI">
          <p className="text-sm text-slate-600">
            Cập nhật thông tin, chọn CV mặc định và cấp hoặc thu hồi quyền xử lý
            AI từ trang hồ sơ.
          </p>
          <Link
            className="text-sm font-semibold text-emerald-700"
            to="/profile-resume"
          >
            Mở hồ sơ của tôi →
          </Link>
        </Panel>
      </div>
    </Workspace>
  )
}
