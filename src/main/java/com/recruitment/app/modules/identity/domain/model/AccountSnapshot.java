package com.recruitment.app.modules.identity.domain.model;

import java.util.Set;

/** Internal account view; password hash must never be serialized by an API. */
public record AccountSnapshot(Long id, String email, String fullName, String passwordHash,
                              boolean active, int credentialVersion, boolean emailVerified, Set<String> roles) {
    public AccountSnapshot {
        roles = Set.copyOf(roles);
    }

    public AccountSnapshot(Long id, String email, String fullName, String passwordHash,
                           boolean active, Set<String> roles) {
        this(id, email, fullName, passwordHash, active, 1, false, roles);
    }

    @Override
    public String toString() {
        return "AccountSnapshot[id=" + id + ", active=" + active + ", cv=" + credentialVersion + "]";
    }
}
