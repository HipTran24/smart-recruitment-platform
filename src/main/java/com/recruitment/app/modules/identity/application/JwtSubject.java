package com.recruitment.app.modules.identity.application;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

/**
 * The minimum, current authorization state needed to mint an access token.
 *
 * <p>The subject is deliberately independent from the persistence entity so
 * token issuance does not expose JPA models outside the identity module.</p>
 */
public record JwtSubject(Long userId, Set<String> roleCodes) {

    public JwtSubject {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        Objects.requireNonNull(roleCodes, "role codes must not be null");

        LinkedHashSet<String> normalizedRoles = new LinkedHashSet<>();
        for (String roleCode : roleCodes) {
            if (roleCode == null || !roleCode.matches("ROLE_[A-Z0-9_]{1,45}")) {
                throw new IllegalArgumentException("role codes must use the ROLE_<UPPER_SNAKE_CASE> format");
            }
            normalizedRoles.add(roleCode);
        }
        if (normalizedRoles.isEmpty()) {
            throw new IllegalArgumentException("at least one role code is required");
        }
        roleCodes = Collections.unmodifiableSet(normalizedRoles);
    }
}
