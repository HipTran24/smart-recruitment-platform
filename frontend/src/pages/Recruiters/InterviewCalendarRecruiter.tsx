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
export default function InterviewCalendar() {
  const resource = useResource((signal) =>
    workspaceService.interviews("recruiter", signal),
  )
  return (
    <Workspace
      title="Lịch phỏng vấn"
      description="Lịch phỏng vấn được lưu theo múi giờ của bạn."
      actions={
        <Link
          to="/recruiter/evaluations"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Lên lịch từ hồ sơ
        </Link>
      }
    >
      <ResourceState resource={resource} />
      {resource.data
        ?.slice()
        .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))
        .map((i) => (
          <Panel key={i.id} title={i.title}>
            <p className="font-medium">
              {dateTime(i.scheduledAt)} · {i.durationMinutes} phút
            </p>
            <p className="break-all text-sm">{i.locationOrUrl}</p>
            <p className="text-sm text-slate-600">{i.status}</p>
            <Link
              to={`/recruiter/candidates/${i.jobApplicationId}`}
              className="text-sm text-blue-700"
            >
              Xem hồ sơ ứng viên →
            </Link>
          </Panel>
        ))}
      {resource.data?.length === 0 && <Empty text="Chưa có lịch phỏng vấn." />}
    </Workspace>
  )
}
