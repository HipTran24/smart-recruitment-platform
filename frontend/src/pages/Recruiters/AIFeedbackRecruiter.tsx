import { Link } from "react-router-dom"
import { workspaceService } from "../../services/workspace.service"
import { useResource } from "../../hooks/useResource"
import {
  Workspace,
  Panel,
  ResourceState,
  Empty,
} from "../../components/ui/Workspace"
export default function AIFeedbackDraftStudio() {
  const resource = useResource(workspaceService.feedbacks)
  return (
    <Workspace
      title="Phản hồi ứng viên"
      description="Bản nháp được lưu trên hệ thống để nhà tuyển dụng kiểm tra nội dung trước khi sử dụng."
    >
      <Link to="/recruiter/evaluations" className="text-sm text-blue-700">
        Chọn hồ sơ để soạn phản hồi →
      </Link>
      <ResourceState resource={resource} />
      {resource.data?.map((d) => (
        <Panel key={d.id} title={`Hồ sơ #${d.jobApplicationId}`}>
          <p className="whitespace-pre-wrap text-sm">{d.content}</p>
          <p className="text-sm text-slate-600">{d.status}</p>
          <Link
            to={`/recruiter/evaluations?applicationId=${d.jobApplicationId}`}
            className="text-sm text-blue-700"
          >
            Chỉnh sửa bản nháp →
          </Link>
        </Panel>
      ))}
      {resource.data?.length === 0 && (
        <Empty text="Chưa có bản nháp phản hồi." />
      )}
    </Workspace>
  )
}
