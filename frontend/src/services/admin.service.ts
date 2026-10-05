import { apiClient } from '../lib/api';

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  active: boolean;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
}

export interface UserPageResponse {
  items: UserSummary[];
  total: number;
  page: number;
  size: number;
}

export interface AuditEventItem {
  id: number;
  createdAt: string;
  actorUserId?: number;
  action: string;
  resourceType: string;
  resourceId: string;
  metadataJson?: string;
  ipAddress?: string;
}

export interface AuditEventPageResponse {
  items: AuditEventItem[];
  total: number;
  page: number;
  size: number;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  aiModelVersion: string;
  maxUploadSizeMb: number;
}

export interface AdminSkillItem {
  id: number;
  name: string;
  category?: string;
}

export const adminService = {
  async getUsers(params?: {
    keyword?: string;
    role?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }): Promise<UserPageResponse> {
    const q = new URLSearchParams();
    if (params?.keyword) q.set('keyword', params.keyword);
    if (params?.role) q.set('role', params.role);
    if (params?.active !== undefined) q.set('active', String(params.active));
    if (params?.page !== undefined) q.set('page', String(params.page));
    if (params?.size !== undefined) q.set('size', String(params.size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<UserPageResponse>(`/api/v1/admin/users${qs}`, { auth: true });
  },

  async getUser(id: number | string): Promise<UserSummary> {
    return apiClient.get<UserSummary>(`/api/v1/admin/users/${id}`, { auth: true });
  },

  async updateUserRoles(id: number | string, roles: string[]): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/api/v1/admin/users/${id}/roles`, { roles }, { auth: true });
  },

  async updateUserStatus(id: number | string, active: boolean): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/api/v1/admin/users/${id}/status`, { active }, { auth: true });
  },

  async getSkills(): Promise<AdminSkillItem[]> {
    return apiClient.get<AdminSkillItem[]>('/api/v1/admin/skills', { auth: true });
  },

  async createSkill(payload: { name: string; category?: string }): Promise<AdminSkillItem> {
    return apiClient.post<AdminSkillItem>('/api/v1/admin/skills', payload, { auth: true });
  },

  async deleteSkill(id: number | string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/v1/admin/skills/${id}`, { auth: true });
  },

  async getAuditEvents(params?: {
    actorUserId?: number;
    action?: string;
    resourceType?: string;
    page?: number;
    size?: number;
  }): Promise<AuditEventPageResponse> {
    const q = new URLSearchParams();
    if (params?.actorUserId) q.set('actorUserId', String(params.actorUserId));
    if (params?.action) q.set('action', params.action);
    if (params?.resourceType) q.set('resourceType', params.resourceType);
    if (params?.page !== undefined) q.set('page', String(params.page));
    if (params?.size !== undefined) q.set('size', String(params.size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<AuditEventPageResponse>(`/api/v1/admin/audit-events${qs}`, { auth: true });
  },

  async getSettings(): Promise<SystemSettings> {
    return apiClient.get<SystemSettings>('/api/v1/admin/operations/settings', { auth: true });
  },

  async updateSettings(payload: SystemSettings): Promise<SystemSettings> {
    return apiClient.put<SystemSettings>('/api/v1/admin/operations/settings', payload, { auth: true });
  },
};
