package com.recruitment.app.modules.identity.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "users",
        uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email")
)
public class User extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "credential_version", nullable = false)
    private int credentialVersion = 1;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public User(String email, String passwordHash, String fullName) {
        this.email = normalizeEmail(email);
        this.passwordHash = requireText(passwordHash, "password hash");
        this.fullName = requireText(fullName, "full name");
    }

    public void addRole(Role role) {
        Objects.requireNonNull(role, "role must not be null");
        if ("ROLE_RECRUITER".equals(role.getCode()) && hasRole("ROLE_PLATFORM_ADMIN")) {
            throw new IllegalStateException("Platform Administrator cannot hold Recruiter role");
        }
        if ("ROLE_PLATFORM_ADMIN".equals(role.getCode()) && hasRole("ROLE_RECRUITER")) {
            throw new IllegalStateException("Platform Administrator cannot hold Recruiter role");
        }
        roles.add(role);
    }

    public boolean hasRole(String roleCode) {
        return roles.stream().anyMatch(r -> roleCode.equals(r.getCode()));
    }

    public void removeRole(Role role) {
        roles.remove(Objects.requireNonNull(role, "role must not be null"));
    }

    public Set<Role> getRoles() {
        return Collections.unmodifiableSet(roles);
    }

    public void updateProfile(String fullName) {
        this.fullName = requireText(fullName, "full name");
    }

    public void changePassword(String passwordHash) {
        this.passwordHash = requireText(passwordHash, "password hash");
        this.credentialVersion++;
    }

    public void incrementCredentialVersion() {
        this.credentialVersion++;
    }

    public void verifyEmail() {
        this.emailVerified = true;
    }

    public void deactivate() {
        active = false;
    }

    public void activate() {
        active = true;
    }

    @PrePersist
    @PreUpdate
    void normalizePersistedValues() {
        email = normalizeEmail(email);
        fullName = requireText(fullName, "full name");
    }

    private static String normalizeEmail(String email) {
        String normalized = requireText(email, "email").toLowerCase(Locale.ROOT);
        if (!normalized.contains("@") || normalized.startsWith("@") || normalized.endsWith("@")) {
            throw new IllegalArgumentException("email must be valid");
        }
        return normalized;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }
}
