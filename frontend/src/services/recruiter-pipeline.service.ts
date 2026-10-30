import { apiClient, type PageResponse } from "../lib/api"

// RecruiterApplicationController / ApplicationDtos.ApplicationResponse wire format.
export interface PipelineApplication {
  id: number
  jobId: number
  jobTitle: string
  candidateName: string
  candidateEmail: string
  status: string
  createdAt: string
  screeningScore: number | null
  screeningRecommendation: string | null
  screeningSummary: string | null
  matchedCriteria: string | null
  missingCriteria: string | null
  histories: { fromStatus: string | null; toStatus: string; createdAt: string }[]
}
export const pipelineStatuses = [
  "SUBMITTED",
  "IN_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
] as const
export function criteriaList(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    )
      return parsed
  } catch {
    /* Older plain-text records. */
  }
  return [value]
}
export const recruiterPipelineService = {
  async list(
    params: { jobId?: number; status?: string; page?: number; size?: number } = {},
    signal?: AbortSignal,
  ) {
    const result = await apiClient.get<PageResponse<PipelineApplication>>(
      "/api/v1/recruiter/applications",
      { auth: true, params, signal },
    )
    if (
      !Array.isArray(result.items) ||
      !Number.isInteger(result.totalPages) ||
      !Number.isInteger(result.totalElements) ||
      result.totalPages < 0 ||
      result.totalElements < 0
    )
      throw new Error("Không đọc được danh sách hồ sơ.")
    const items = result.items.map((item) => {
      const score = item.screeningScore ?? null
      if (
        !Number.isSafeInteger(item.id) ||
        !Number.isSafeInteger(item.jobId) ||
        typeof item.status !== "string" ||
        !Number.isFinite(Date.parse(item.createdAt)) ||
        (score !== null &&
          (typeof score !== "number" ||
            !Number.isFinite(score) ||
            score < 0 ||
            score > 100))
      )
        throw new Error("Dữ liệu hồ sơ không hợp lệ.")
      return { ...item, screeningScore: score, histories: item.histories ?? [] }
    })
    return { ...result, items }
  },
  async transition(id: number, stage: string, note: string) {
    return apiClient.post<PipelineApplication>(
      `/api/v1/recruiter/applications/${id}/transitions`,
      { stage, note },
      { auth: true },
    )
  },
  async all(
    signal: AbortSignal,
    filters: { jobId?: number; status?: string } = {},
  ): Promise<PipelineApplication[]> {
    const first = await this.list({ ...filters, page: 0, size: 100 }, signal)
    if (first.totalPages > 100)
      throw new Error(
        "Có quá nhiều hồ sơ để tổng hợp tại đây. Cần báo cáo tổng hợp từ máy chủ.",
      )
    const items = [...first.items]
    for (let page = 1; page < first.totalPages; page++) {
      const next = await this.list({ ...filters, page, size: 100 }, signal)
      if (
        next.totalElements !== first.totalElements ||
        next.totalPages !== first.totalPages
      )
        throw new Error("Dữ liệu đã thay đổi trong lúc tải. Vui lòng tải lại.")
      items.push(...next.items)
    }
    if (
      new Set(items.map((item) => item.id)).size !== first.totalElements ||
      items.length !== first.totalElements
    )
      throw new Error("Danh sách chưa đầy đủ. Vui lòng tải lại.")
    return items
  },
}
