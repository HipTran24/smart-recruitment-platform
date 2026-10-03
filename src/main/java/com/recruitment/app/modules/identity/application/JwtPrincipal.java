package com.recruitment.app.modules.identity.application;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.security.Principal;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Authenticated actor reconstructed from a verified application access token.
 * It contains only stable authorization data; personal profile data remains in
 * the identity database.
 */
public record JwtPrincipal(Long userId, Set<String> roleCodes, String tokenId, int credentialVersion) implements Principal {

    public JwtPrincipal {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        if (credentialVersion <= 0) {
            throw new IllegalArgumentException("credential version must be positive");
        }
        Objects.requireNonNull(roleCodes, "role codes must not be null");
        LinkedHashSet<String> normalizedRoles = new LinkedHashSet<>();
        for (String roleCode : roleCodes) {
            if (roleCode == null || !roleCode.matches("ROLE_[A-Z0-9_]{1,45}")) {
                throw new IllegalArgumentException("role code is invalid");
            }
            normalizedRoles.add(roleCode);
        }
        if (normalizedRoles.isEmpty()) {
            throw new IllegalArgumentException("at least one role code is required");
        }
        roleCodes = Collections.unmodifiableSet(normalizedRoles);
        if (tokenId == null || tokenId.isBlank()) {
            throw new IllegalArgumentException("token id must not be blank");
        }
    }

    public JwtPrincipal(Long userId, Set<String> roleCodes, String tokenId) {
        this(userId, roleCodes, tokenId, 1);
    }

    @Override
    public String getName() {
        return userId.toString();
    }

    public List<GrantedAuthority> authorities() {
        return roleCodes.stream().map(SimpleGrantedAuthority::new).map(GrantedAuthority.class::cast).toList();
    }
}
