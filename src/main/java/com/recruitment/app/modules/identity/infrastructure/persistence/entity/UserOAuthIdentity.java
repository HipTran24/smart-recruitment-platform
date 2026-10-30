package com.recruitment.app.modules.identity.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Locale;
import java.util.Objects;

/**
 * Stable external identity binding. The provider subject, rather than an email
 * address, is the primary key used to recognize an OAuth account.
 */
@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "user_oauth_identities",
        indexes = @Index(name = "idx_user_oauth_identities_user_id", columnList = "user_id"),
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_oauth_identities_provider_subject",
                        columnNames = {"provider", "provider_subject"}
                ),
                @UniqueConstraint(
                        name = "uk_user_oauth_identities_user_provider",
                        columnNames = {"user_id", "provider"}
                )
        }
)
public class UserOAuthIdentity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_oauth_identities_user")
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Provider provider;

    @Column(name = "provider_subject", nullable = false, length = 255)
    private String providerSubject;

    @Column(name = "provider_email", length = 255)
    private String providerEmail;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    public UserOAuthIdentity(
            User user,
            Provider provider,
            String providerSubject,
            String providerEmail,
            boolean emailVerified
    ) {
        this.user = Objects.requireNonNull(user, "user must not be null");
        this.provider = Objects.requireNonNull(provider, "provider must not be null");
        this.providerSubject = requireText(providerSubject, "provider subject");
        this.providerEmail = normalizeOptionalEmail(providerEmail);
        this.emailVerified = emailVerified;
    }

    public void refreshProfile(String providerEmail, boolean emailVerified) {
        this.providerEmail = normalizeOptionalEmail(providerEmail);
        this.emailVerified = emailVerified;
    }

    public enum Provider {
        GOOGLE
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }

    private static String normalizeOptionalEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.strip().toLowerCase(Locale.ROOT);
    }
}
