import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { workspaceService } from "../../services/workspace.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  Field,
  control,
  ResourceState,
  Notice,
  dateTime,
} from "../../components/ui/Workspace"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"

export default function ReviewOffer() {
  const { offerId = "" } = useParams()
  const resource = useResource(
    (signal) => workspaceService.offer(offerId, signal),
    [offerId],
  )
  const [action, setAction] = useState<"accept" | "decline" | null>(null)
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function respond() {
    if (!action || !resource.data) return
    setBusy(true)
    setError("")
    try {
      await workspaceService.respond(resource.data.id, action, comment)
      setAction(null)
      resource.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không gửi được phản hồi.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <Workspace
      title="Review Offer"
      description="Xem điều khoản và gửi quyết định của bạn."
    >
      <Link to="/interviews-offers" className="text-sm text-emerald-700">
        ← Phỏng vấn & đề nghị
      </Link>
      <ResourceState resource={resource} />
      <Notice text={error} error />
      {resource.data && (
        <Panel title={`Đề nghị #${resource.data.id}`}>
          <p className="text-3xl font-semibold">
            {resource.data.salaryOffered.toLocaleString("vi-VN")}{" "}
            {resource.data.salaryCurrency}
          </p>
          <p>Ngày bắt đầu: {resource.data.startDate}</p>
          <p>Hạn phản hồi: {dateTime(resource.data.deadline)}</p>
          <p className="whitespace-pre-wrap">{resource.data.notes}</p>
          <p className="font-semibold">{resource.data.status}</p>
          {resource.data.status === "SENT" &&
            Date.parse(resource.data.deadline) > Date.now() && (
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setAction("accept")}>
                  Chấp nhận đề nghị
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setAction("decline")}
                >
                  Từ chối đề nghị
                </Button>
              </div>
            )}
        </Panel>
      )}
      <Modal
        open={action !== null}
        onClose={() => {
          if (!busy) setAction(null)
        }}
        title={action === "accept" ? "Xác nhận chấp nhận" : "Xác nhận từ chối"}
      >
        <div className="space-y-4">
          <Field label="Lời nhắn">
            <textarea
              className={control}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
            />
          </Field>
          <Button disabled={busy} onClick={() => void respond()}>
            {busy ? "Đang gửi…" : "Gửi quyết định"}
          </Button>
        </div>
      </Modal>
    </Workspace>
  )
}
