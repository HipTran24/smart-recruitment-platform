package com.recruitment.app.modules.identity.application.port.out;

import com.recruitment.app.modules.identity.domain.model.NotificationSnapshot;

import java.util.List;

public interface UserNotificationStore {
    NotificationSnapshot save(NotificationSnapshot notification);
    List<NotificationSnapshot> findByUserId(Long userId, int page, int size);
    long countUnread(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
