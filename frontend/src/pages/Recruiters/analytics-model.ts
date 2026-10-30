import {
  pipelineStatuses,
  type PipelineApplication,
} from "../../services/recruiter-pipeline.service"

export function validDay(value: string) {
  return (
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value)
  )
}
export function cohort(
  items: PipelineApplication[],
  job: string,
  from: string,
  to: string,
) {
  const start = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity
  const end = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity
  return items.filter(
    (item) =>
      (!job || String(item.jobId) === job) &&
      Date.parse(item.createdAt) >= start &&
      Date.parse(item.createdAt) <= end,
  )
}
export function statusCounts(items: PipelineApplication[]) {
  return pipelineStatuses.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }))
}
export function reachedCounts(items: PipelineApplication[]) {
  return ["SUBMITTED", "IN_REVIEW", "SHORTLISTED", "INTERVIEW", "OFFERED"].map(
    (status) => ({
      status,
      count: items.filter(
        (item) =>
          item.status === status ||
          item.histories?.some(
            (history) =>
              history.toStatus === status || history.fromStatus === status,
          ),
      ).length,
    }),
  )
}
