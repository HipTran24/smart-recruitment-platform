import { Link } from "react-router-dom"
import { workspaceService } from "../../services/workspace.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  ResourceState,
  Empty,
  dateTime,
} from "../../components/ui/Workspace"

export default function InterviewsOffer() {
  const resource = useResource(async (signal) => {
    const [interviews, offers] = await Promise.all([
      workspaceService.interviews("candidates/me", signal),
      workspaceService.offers(signal),
    ])
    return { interviews, offers }
  })
  return (
    <Workspace
      title="Interviews & Offers"
      description="Lịch phỏng vấn và đề nghị tuyển dụng dành cho bạn."
    >
      <ResourceState resource={resource} />
      {resource.data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Lịch phỏng vấn">
            {!resource.data.interviews.length && (
              <Empty text="Chưa có lịch phỏng vấn." />
            )}
            {resource.data.interviews.map((i) => (
              <div
                className="space-y-2 rounded-xl border border-slate-200 p-4"
                key={i.id}
              >
                <h3 className="font-semibold">{i.title}</h3>
                <p className="text-sm">
                  {dateTime(i.scheduledAt)} · {i.durationMinutes} phút
                </p>
                <p className="text-sm text-slate-600">{i.status}</p>
                <p className="break-all text-sm">{i.locationOrUrl}</p>
                {i.notes && <p className="text-sm">{i.notes}</p>}
              </div>
            ))}
          </Panel>
          <Panel title="Đề nghị tuyển dụng">
            {!resource.data.offers.length && (
              <Empty text="Chưa có đề nghị tuyển dụng." />
            )}
            {resource.data.offers.map((o) => (
              <div
                className="space-y-2 rounded-xl border border-slate-200 p-4"
                key={o.id}
              >
                <p className="font-semibold">
                  {o.salaryOffered.toLocaleString("vi-VN")} {o.salaryCurrency}
                </p>
                <p className="text-sm">
                  {o.status} · hạn phản hồi {dateTime(o.deadline)}
                </p>
                <Link
                  to={`/offers/${o.id}/review`}
                  className="text-sm font-semibold text-emerald-700"
                >
                  Xem và phản hồi →
                </Link>
              </div>
            ))}
          </Panel>
        </div>
      )}
    </Workspace>
  )
}
