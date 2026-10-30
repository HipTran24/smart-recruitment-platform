import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  notificationService,
  type NotificationPageResponse,
} from "../../services/notification.service"
import { PageHeader } from "../../components/ui/PageHeader"
import { Button } from "../../components/ui/Button"

export function safeNotificationPath(value?: string) {
  return value &&
    /^\/recruiter(?:\/|$)/.test(value) &&
    !/[\\\u0000-\u0020]/.test(value)
    ? value
    : undefined
}
export default function NotificationAuditLogCenter() {
  const [page, setPage] = useState(0)
  const [revision, refresh] = useState(0)
  const [data, setData] = useState<NotificationPageResponse>({
    items: [],
    unreadCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    notificationService
      .getNotifications(page, 20)
      .then((result) => {
        if (
          !Array.isArray(result.items) ||
          typeof result.unreadCount !== "number"
        )
          throw new Error("Invalid response")
        if (active) setData(result)
      })
      .catch(() => {
        if (active) setError("Không tải được thông báo. Vui lòng thử lại.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, revision])
  async function mark(id?: number) {
    if (saving) return
    setSaving(true)
    setError("")
    setNotice("")
    try {
      if (id === undefined) await notificationService.markAllAsRead()
      else await notificationService.markAsRead(id)
      setNotice("Đã đánh dấu thông báo đã đọc.")
      refresh((value) => value + 1)
    } catch {
      setError("Chưa xác nhận được thao tác. Tải lại để kiểm tra trạng thái.")
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Thông báo"
        description="Thông báo của tài khoản đang đăng nhập."
        actions={
          <Button
            disabled={loading || saving || data.unreadCount === 0}
            onClick={() => mark()}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        }
      />
      {notice && (
        <p role="status" className="text-emerald-800">
          {notice}
        </p>
      )}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <Button
            disabled={saving}
            onClick={() => refresh((value) => value + 1)}
          >
            Tải lại
          </Button>
        </div>
      )}
      {loading ? (
        <p role="status">Đang tải thông báo…</p>
      ) : (
        !error && (
          <>
            <p role="status">{data.unreadCount} thông báo chưa đọc</p>
            {!data.items.length ? (
              <p>Không có thông báo trên trang này.</p>
            ) : (
              <ul className="space-y-3">
                {data.items.map((item) => {
                  const action = safeNotificationPath(item.actionUrl)
                  return (
                    <li
                      key={item.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl break-words"
                    >
                      <h2 className="font-semibold">{item.title}</h2>
                      <p className="text-sm text-slate-700 my-2">
                        {item.message}
                      </p>
                      <p className="text-xs text-slate-600">
                        {item.read ? "Đã đọc" : "Chưa đọc"} ·{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {action && (
                          <Link className="text-blue-800 underline" to={action}>
                            Xem chi tiết
                          </Link>
                        )}
                        {!item.read && (
                          <Button
                            variant="secondary"
                            disabled={saving}
                            onClick={() => mark(item.id)}
                          >
                            Đánh dấu đã đọc
                            <span className="sr-only">: {item.title}</span>
                          </Button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <nav
              aria-label="Phân trang thông báo"
              className="flex flex-wrap gap-3 items-center"
            >
              <Button
                disabled={page === 0 || saving}
                onClick={() => setPage((value) => value - 1)}
              >
                Trang trước
              </Button>
              <span>Trang {page + 1}</span>
              <Button
                disabled={data.items.length < 20 || saving}
                onClick={() => setPage((value) => value + 1)}
              >
                Trang sau
              </Button>
            </nav>
          </>
        )
      )}
      <aside className="text-sm text-slate-700 border-t border-slate-200 pt-4">
        Nhật ký kiểm toán tuyển dụng hiện chưa khả dụng trong màn hình này.
        Không hiển thị sự kiện mẫu như dữ liệu thật.
      </aside>
    </section>
  )
}
