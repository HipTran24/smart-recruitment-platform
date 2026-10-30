import { apiClient } from '../lib/api';

export interface ApplicationSummary {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateUserId: number;
  candidateName: string;
  candidateEmail: string;
  stage: string;
  aiScore?: number;
  submittedAt: string;
  updatedAt: string;
}

export interface ScreeningResult {
  id: number;
  matchScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
  screenedAt: string;
}

export interface EvaluationItem {
  id: number;
  evaluatorUserId: number;
  score: number;
  recommendation: string;
  technicalNotes?: string;
  culturalFitNotes?: string;
  strengths?: string;
  areasForGrowth?: string;
  createdAt: string;
}

export interface InterviewItem {
  id: number;
  interviewType: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  status: string;
  notes?: string;
}

export interface OfferItem {
  id: number;
  salaryOffered: number;
  currency: string;
  status: string;
  expiresAt: string;
  notes?: string;
}

export interface FeedbackDraftItem {
  id: number;
  content: string;
  status: string;
  deliveryStatus?: string;
  approvedAt?: string;
  sentAt?: string;
}

export interface ApplicationDossier {
  application: ApplicationSummary;
  screening?: ScreeningResult;
  evaluations: EvaluationItem[];
  interviews: InterviewItem[];
  offers: OfferItem[];
  feedbackDraft?: FeedbackDraftItem;
  coverLetter?: string;
  resumeFileName?: string;
  resumeParsedText?: string;
}

export interface ApplicationPageResponse {
  items: ApplicationSummary[];
  total: number;
  page: number;
  size: number;
}

export interface CreateEvaluationPayload {
  score: number;
  recommendation: string;
  technicalNotes?: string;
  culturalFitNotes?: string;
  strengths?: string;
  areasForGrowth?: string;
}

export interface ScheduleInterviewPayload {
  interviewType: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  notes?: string;
}

export interface CreateOfferPayload {
  salaryOffered: number;
  currency: string;
  expiresAt: string;
  notes?: string;
}

export const applicationService = {
  async applyForJob(jobId: number | string, payload: { resumeId: number; coverLetter?: string }): Promise<ApplicationSummary> {
    return apiClient.post<ApplicationSummary>(`/api/v1/jobs/${jobId}/applications`, payload, { auth: true });
  },

  async getMyApplications(): Promise<ApplicationSummary[]> {
    return apiClient.get<ApplicationSummary[]>('/api/v1/candidates/me/applications', { auth: true });
  },

  async getRecruiterApplications(params?: {
    jobId?: number;
    stage?: string;
    page?: number;
    size?: number;
  }): Promise<ApplicationPageResponse> {
    const q = new URLSearchParams();
    if (params?.jobId) q.set('jobId', String(params.jobId));
    if (params?.stage) q.set('stage', params.stage);
    if (params?.page !== undefined) q.set('page', String(params.page));
    if (params?.size !== undefined) q.set('size', String(params.size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<ApplicationPageResponse>(`/api/v1/recruiter/applications${qs}`, { auth: true });
  },

  async getApplicationDossier(applicationId: number | string): Promise<ApplicationDossier> {
    return apiClient.get<ApplicationDossier>(`/api/v1/recruiter/applications/${applicationId}/dossier`, { auth: true });
  },

  async updateStage(applicationId: number | string, newStage: string, rejectionReason?: string): Promise<ApplicationSummary> {
    return apiClient.put<ApplicationSummary>(
      `/api/v1/recruiter/applications/${applicationId}/stage`,
      { newStage, rejectionReason },
      { auth: true }
    );
  },

  async triggerScreening(applicationId: number | string): Promise<ScreeningResult> {
    return apiClient.post<ScreeningResult>(`/api/v1/recruiter/applications/${applicationId}/screening`, {}, { auth: true });
  },

  async createEvaluation(applicationId: number | string, payload: CreateEvaluationPayload): Promise<EvaluationItem> {
    return apiClient.post<EvaluationItem>(`/api/v1/recruiter/applications/${applicationId}/evaluations`, payload, { auth: true });
  },

  async getInterviews(applicationId: number | string): Promise<InterviewItem[]> {
    return apiClient.get<InterviewItem[]>(`/api/v1/recruiter/applications/${applicationId}/interviews`, { auth: true });
  },

  async scheduleInterview(applicationId: number | string, payload: ScheduleInterviewPayload): Promise<InterviewItem> {
    return apiClient.post<InterviewItem>(`/api/v1/recruiter/applications/${applicationId}/interviews`, payload, { auth: true });
  },

  async getOffers(applicationId: number | string): Promise<OfferItem[]> {
    return apiClient.get<OfferItem[]>(`/api/v1/recruiter/applications/${applicationId}/offers`, { auth: true });
  },

  async issueOffer(applicationId: number | string, payload: CreateOfferPayload): Promise<OfferItem> {
    return apiClient.post<OfferItem>(`/api/v1/recruiter/applications/${applicationId}/offers`, payload, { auth: true });
  },

  async respondToOffer(offerId: number | string, action: 'ACCEPT' | 'REJECT' | 'DECLINE'): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/api/v1/candidates/offers/${offerId}/response`, { action }, { auth: true });
  },

  async getFeedbackDraft(applicationId: number | string): Promise<FeedbackDraftItem> {
    return apiClient.get<FeedbackDraftItem>(`/api/v1/recruiter/applications/${applicationId}/feedback`, { auth: true });
  },

  async saveFeedbackDraft(applicationId: number | string, content: string): Promise<FeedbackDraftItem> {
    return apiClient.put<FeedbackDraftItem>(`/api/v1/recruiter/applications/${applicationId}/feedback`, { content }, { auth: true });
  },
};
