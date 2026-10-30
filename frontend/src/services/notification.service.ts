import { apiClient } from '../lib/api';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationPageResponse {
  items: NotificationItem[];
  unreadCount: number;
}

export const notificationService = {
  async getNotifications(page = 0, size = 20): Promise<NotificationPageResponse> {
    return apiClient.get<NotificationPageResponse>(`/api/v1/notifications?page=${page}&size=${size}`, { auth: true });
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ unreadCount: number }>('/api/v1/notifications/unread-count', { auth: true });
    return res.unreadCount;
  },

  async markAsRead(id: number | string): Promise<void> {
    await apiClient.put(`/api/v1/notifications/${id}/read`, {}, { auth: true });
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/api/v1/notifications/read-all', {}, { auth: true });
  },
};
