package com.recruitment.app.modules.identity.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public final class AdminDtos {
    private AdminDtos() {}

    public record UserSummaryResponse(
            Long id,
            String email,
            String fullName,
            boolean active,
            boolean emailVerified,
            Set<String> roles,
            Instant createdAt
    ) {}

    public record UserPageResponse(
            List<UserSummaryResponse> items,
            long total,
            int page,
            int size
    ) {}

    public record UpdateUserRolesRequest(
            Set<String> roles
    ) {}

    public record UpdateUserStatusRequest(
            boolean active
    ) {}

    public record AuditEventResponse(
            Long id,
            Instant createdAt,
            Long actorUserId,
            String action,
            String resourceType,
            String resourceId,
            String metadataJson,
            String ipAddress
    ) {}

    public record AuditEventPageResponse(
            List<AuditEventResponse> items,
            long total,
            int page,
            int size
    ) {}

    public record SystemSettingsRequest(
            boolean maintenanceMode,
            boolean registrationEnabled,
            String aiModelVersion,
            int maxUploadSizeMb
    ) {}

    public record SystemSettingsResponse(
            boolean maintenanceMode,
            boolean registrationEnabled,
            String aiModelVersion,
            int maxUploadSizeMb
    ) {}
}
