package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.port.out.UserNotificationStore;
import com.recruitment.app.modules.identity.domain.model.NotificationSnapshot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class UserNotificationService {

    private final UserNotificationStore notificationStore;

    public UserNotificationService(UserNotificationStore notificationStore) {
        this.notificationStore = Objects.requireNonNull(notificationStore, "notificationStore must not be null");
    }

    @Transactional
    public NotificationSnapshot createNotification(Long userId, String title, String message, String type, String actionUrl) {
        NotificationSnapshot snapshot = new NotificationSnapshot(
                null,
                userId,
                title,
                message,
                type,
                false,
                null,
                actionUrl,
                Instant.now()
        );
        return notificationStore.save(snapshot);
    }

    @Transactional(readOnly = true)
    public List<NotificationSnapshot> getNotifications(Long userId, int page, int size) {
        return notificationStore.findByUserId(userId, page, size);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationStore.countUnread(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationStore.markAsRead(notificationId, userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationStore.markAllAsRead(userId);
    }
}
