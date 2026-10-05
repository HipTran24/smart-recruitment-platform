import { apiClient } from '../lib/api';

export interface EducationItem {
  id: number;
  institutionName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ExperienceItem {
  id: number;
  companyName: string;
  jobTitle: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CandidateSkillItem {
  id: number;
  skillId: number;
  skillName?: string;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
}

export interface ResumeItem {
  id: number;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  primaryResume: boolean;
  scanStatus?: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: number;
  userId: number;
  phone?: string;
  headline?: string;
  city?: string;
  bio?: string;
  aiProcessingConsented: boolean;
  consentedAt?: string;
  educations: EducationItem[];
  experiences: ExperienceItem[];
  skills: CandidateSkillItem[];
  resumes: ResumeItem[];
}

export interface UpdateProfilePayload {
  phone?: string;
  headline?: string;
  city?: string;
  bio?: string;
}

export interface AddEducationPayload {
  institutionName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface AddExperiencePayload {
  companyName: string;
  jobTitle: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface AddSkillPayload {
  skillId: number;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
}

export interface RegisterResumePayload {
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  parsedText?: string;
}

export const candidateService = {
  async getProfile(): Promise<CandidateProfile> {
    return apiClient.get<CandidateProfile>('/api/v1/candidates/me', { auth: true });
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<CandidateProfile> {
    return apiClient.put<CandidateProfile>('/api/v1/candidates/me', payload, { auth: true });
  },

  async updateConsent(consented: boolean): Promise<CandidateProfile> {
    return apiClient.put<CandidateProfile>('/api/v1/candidates/me/consent', { consented }, { auth: true });
  },

  async addEducation(payload: AddEducationPayload): Promise<CandidateProfile> {
    return apiClient.post<CandidateProfile>('/api/v1/candidates/me/educations', payload, { auth: true });
  },

  async deleteEducation(id: number): Promise<CandidateProfile> {
    return apiClient.delete<CandidateProfile>(`/api/v1/candidates/me/educations/${id}`, { auth: true });
  },

  async addExperience(payload: AddExperiencePayload): Promise<CandidateProfile> {
    return apiClient.post<CandidateProfile>('/api/v1/candidates/me/experiences', payload, { auth: true });
  },

  async deleteExperience(id: number): Promise<CandidateProfile> {
    return apiClient.delete<CandidateProfile>(`/api/v1/candidates/me/experiences/${id}`, { auth: true });
  },

  async addSkill(payload: AddSkillPayload): Promise<CandidateProfile> {
    return apiClient.post<CandidateProfile>('/api/v1/candidates/me/skills', payload, { auth: true });
  },

  async deleteSkill(id: number): Promise<CandidateProfile> {
    return apiClient.delete<CandidateProfile>(`/api/v1/candidates/me/skills/${id}`, { auth: true });
  },

  async getResumes(): Promise<ResumeItem[]> {
    return apiClient.get<ResumeItem[]>('/api/v1/candidates/me/resumes', { auth: true });
  },

  async registerResume(payload: RegisterResumePayload): Promise<ResumeItem> {
    return apiClient.post<ResumeItem>('/api/v1/candidates/me/resumes', payload, { auth: true });
  },

  async setPrimaryResume(id: number): Promise<void> {
    return apiClient.post<void>(`/api/v1/candidates/me/resumes/${id}/primary`, {}, { auth: true });
  },
};
