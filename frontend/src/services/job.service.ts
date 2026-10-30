import { apiClient } from '../lib/api';

export interface SkillItem {
  id: number;
  name: string;
  category?: string;
}

export interface JobSummary {
  id: number;
  title: string;
  slug: string;
  companyName: string;
  location: string;
  employmentType: string;
  workplaceType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  status: string;
  publishedAt?: string;
  expiresAt?: string;
}

export interface JobDetail extends JobSummary {
  companyId: number;
  createdByUserId: number;
  description: string;
  requirements: string;
  headcount?: number;
  closedAt?: string;
  skills: SkillItem[];
}

export interface CreateJobPayload {
  companyId: number;
  title: string;
  slug?: string;
  description: string;
  requirements: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  headcount?: number;
  expiresAt?: string;
}

export interface UpdateJobPayload {
  title: string;
  description: string;
  requirements: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  headcount?: number;
  expiresAt?: string;
}

export interface JobPageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const jobService = {
  async getPublishedJobs(params?: {
    query?: string;
    workplaceType?: string;
    employmentType?: string;
    page?: number;
    size?: number;
  }): Promise<JobPageResponse<JobSummary>> {
    const q = new URLSearchParams();
    if (params?.query) q.set('query', params.query);
    if (params?.workplaceType) q.set('workplaceType', params.workplaceType);
    if (params?.employmentType) q.set('employmentType', params.employmentType);
    if (params?.page !== undefined) q.set('page', String(params.page));
    if (params?.size !== undefined) q.set('size', String(params.size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<JobPageResponse<JobSummary>>(`/api/v1/jobs${qs}`, { auth: false });
  },

  async getJobById(id: number | string): Promise<JobDetail> {
    return apiClient.get<JobDetail>(`/api/v1/jobs/${id}`, { auth: false });
  },

  async getJobBySlug(slug: string): Promise<JobDetail> {
    return apiClient.get<JobDetail>(`/api/v1/jobs/slug/${slug}`, { auth: false });
  },

  async getRecruiterJobs(params?: {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<JobPageResponse<JobSummary>> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.page !== undefined) q.set('page', String(params.page));
    if (params?.size !== undefined) q.set('size', String(params.size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<JobPageResponse<JobSummary>>(`/api/v1/recruiter/jobs${qs}`, { auth: true });
  },

  async createJob(payload: CreateJobPayload): Promise<JobDetail> {
    return apiClient.post<JobDetail>('/api/v1/recruiter/jobs', payload, { auth: true });
  },

  async updateJob(id: number | string, payload: UpdateJobPayload): Promise<JobDetail> {
    return apiClient.put<JobDetail>(`/api/v1/recruiter/jobs/${id}`, payload, { auth: true });
  },

  async publishJob(id: number | string): Promise<JobDetail> {
    return apiClient.post<JobDetail>(`/api/v1/recruiter/jobs/${id}/publish`, {}, { auth: true });
  },

  async closeJob(id: number | string): Promise<JobDetail> {
    return apiClient.post<JobDetail>(`/api/v1/recruiter/jobs/${id}/close`, {}, { auth: true });
  },

  async getSkills(): Promise<SkillItem[]> {
    return apiClient.get<SkillItem[]>('/api/v1/skills', { auth: false });
  },
};
