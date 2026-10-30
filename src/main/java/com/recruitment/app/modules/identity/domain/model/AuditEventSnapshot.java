package com.recruitment.app.modules.identity.domain.model;

import java.time.Instant;

public record AuditEventSnapshot(
        Long id,
        Instant createdAt,
        Long actorUserId,
        String action,
        String resourceType,
        String resourceId,
        String metadataJson,
        String ipAddress
) {}
