import { apiClient, type PageResponse } from "../lib/api"
import type { PipelineApplication } from "./recruiter-pipeline.service"
export interface Application extends PipelineApplication {
  candidateResumeId: number | null
  coverLetter: string | null
}
export interface Interview {
  id: number
  jobApplicationId: number
  candidateUserId: number
  title: string
  scheduledAt: string
  durationMinutes: number
  locationOrUrl: string | null
  status: string
  notes: string | null
}
export interface Offer {
  id: number
  jobApplicationId: number
  salaryOffered: number
  salaryCurrency: string
  startDate: string
  deadline: string
  status: string
  notes: string | null
}
export interface Evaluation {
  id: number
  score: number
  recommendation: string
  technicalNotes: string
}
export interface Feedback {
  id: number
  jobApplicationId: number
  content: string
  status: string
  deliveryStatus: string
}
export interface ScreeningStatus {
  id: number | null
  status: string
  score: number | null
  summary: string | null
  failureCode: string | null
  nextAttemptAt?: string | null
  retryable?: boolean
}
const auth = { auth: true }
export const workspaceService = {
  myApplications: (signal: AbortSignal) =>
    apiClient.get<Application[]>("/api/v1/candidates/me/applications", {
      ...auth,
      signal,
    }),
  withdraw: (id: number) =>
    apiClient.post<Application>(
      `/api/v1/candidates/me/applications/${id}/withdraw`,
      {},
      auth,
    ),
  application: (id: string, signal?: AbortSignal) =>
    apiClient.get<Application>(`/api/v1/recruiter/applications/${id}`, {
      ...auth,
      signal,
    }),
  apply: (id: string, candidateResumeId: number, coverLetter: string) =>
    apiClient.post<Application>(
      `/api/v1/jobs/${id}/applications`,
      { candidateResumeId, coverLetter, source: "CAREER_SITE" },
      auth,
    ),
  interviews: (role: "recruiter" | "candidates/me", signal?: AbortSignal) =>
    apiClient.get<Interview[]>(`/api/v1/${role}/interviews`, {
      ...auth,
      signal,
    }),
  offers: (signal?: AbortSignal) =>
    apiClient.get<Offer[]>("/api/v1/candidates/me/offers", { ...auth, signal }),
  offer: (id: string, signal?: AbortSignal) =>
    apiClient.get<Offer>(`/api/v1/candidates/me/offers/${id}`, {
      ...auth,
      signal,
    }),
  respond: (id: number, action: "accept" | "decline", comment: string) =>
    apiClient.post<Offer>(
      `/api/v1/candidates/me/offers/${id}/${action}`,
      { comment },
      auth,
    ),
  screen: (id: number) =>
    apiClient.post<ScreeningStatus>(
      `/api/v1/recruiter/applications/${id}/screening`,
      {},
      auth,
    ),
  screening: (id: number, signal?: AbortSignal) =>
    apiClient.get<ScreeningStatus>(
      `/api/v1/recruiter/applications/${id}/screening`,
      { ...auth, signal },
    ),
  screeningStatuses: (ids: number[], signal?: AbortSignal) =>
    apiClient.get<Record<number, ScreeningStatus>>(
      "/api/v1/recruiter/screening-statuses",
      { ...auth, signal, params: { ids: ids.join(",") } },
    ),
  evaluations: (id: string, signal?: AbortSignal) =>
    apiClient.get<Evaluation[]>(
      `/api/v1/recruiter/applications/${id}/evaluations`,
      { ...auth, signal },
    ),
  evaluate: (
    id: string,
    score: number,
    recommendation: string,
    technicalNotes: string,
  ) =>
    apiClient.post<Evaluation>(
      `/api/v1/recruiter/applications/${id}/evaluations`,
      { score, recommendation, technicalNotes },
      auth,
    ),
  schedule: (
    id: string,
    payload: {
      title: string
      scheduledAt: string
      durationMinutes: number
      locationOrUrl: string
    },
  ) =>
    apiClient.post<Interview>(
      `/api/v1/recruiter/applications/${id}/interviews`,
      {
        ...payload,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      auth,
    ),
  issueOffer: (
    id: string,
    payload: {
      salaryOffered: number
      salaryCurrency: string
      startDate: string
      deadline: string
    },
  ) =>
    apiClient.post<Offer>(
      `/api/v1/recruiter/applications/${id}/offers`,
      payload,
      auth,
    ),
  feedbacks: (signal?: AbortSignal) =>
    apiClient.get<Feedback[]>("/api/v1/recruiter/feedback-drafts", {
      ...auth,
      signal,
    }),
  saveFeedback: (id: string, content: string) =>
    apiClient.put<Feedback>(
      `/api/v1/recruiter/applications/${id}/feedback`,
      { content },
      auth,
    ),
  approveFeedback: (id: number) =>
    apiClient.post<Feedback>(
      `/api/v1/recruiter/feedback-drafts/${id}/approve`,
      {},
      auth,
    ),
}
