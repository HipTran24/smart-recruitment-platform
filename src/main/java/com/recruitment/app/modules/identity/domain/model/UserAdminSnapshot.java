package com.recruitment.app.modules.identity.domain.model;

import java.time.Instant;
import java.util.Set;

public record UserAdminSnapshot(
        Long id,
        String email,
        String fullName,
        boolean active,
        boolean emailVerified,
        int credentialVersion,
        Set<String> roles,
        Instant createdAt,
        Instant updatedAt
) {}
