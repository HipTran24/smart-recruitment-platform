package com.recruitment.app.modules.identity.domain.model;

import java.time.Instant;

public record NotificationSnapshot(
        Long id,
        Long userId,
        String title,
        String message,
        String type,
        boolean read,
        Instant readAt,
        String actionUrl,
        Instant createdAt
) {}
