package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.port.out.UserNotificationStore;
import com.recruitment.app.modules.identity.domain.model.NotificationSnapshot;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.UserNotification;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class JpaUserNotificationStore implements UserNotificationStore {

    private final UserNotificationRepository notificationRepository;

    public JpaUserNotificationStore(UserNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public NotificationSnapshot save(NotificationSnapshot snapshot) {
        UserNotification entity = new UserNotification(
                snapshot.userId(),
                snapshot.title(),
                snapshot.message(),
                snapshot.type(),
                snapshot.actionUrl()
        );
        UserNotification saved = notificationRepository.save(entity);
        return toSnapshot(saved);
    }

    @Override
    public List<NotificationSnapshot> findByUserId(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .getContent()
                .stream()
                .map(this::toSnapshot)
                .toList();
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationSnapshot toSnapshot(UserNotification n) {
        return new NotificationSnapshot(
                n.getId(),
                n.getUserId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getReadAt(),
                n.getActionUrl(),
                n.getCreatedAt() != null ? n.getCreatedAt() : Instant.now()
        );
    }
}
