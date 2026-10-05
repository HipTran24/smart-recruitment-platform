package com.recruitment.app.modules.identity.api.dto;

import java.time.Instant;
import java.util.List;

public final class NotificationDtos {
    private NotificationDtos() {}

    public record NotificationResponse(
            Long id,
            String title,
            String message,
            String type,
            boolean read,
            Instant readAt,
            String actionUrl,
            Instant createdAt
    ) {}

    public record NotificationPageResponse(
            List<NotificationResponse> items,
            long unreadCount
    ) {}

    public record UnreadCountResponse(
            long unreadCount
    ) {}
}
