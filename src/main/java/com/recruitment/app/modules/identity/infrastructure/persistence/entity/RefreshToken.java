package com.recruitment.app.modules.identity.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "refresh_tokens",
        indexes = @Index(name = "idx_refresh_tokens_user_id", columnList = "user_id"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_refresh_tokens_token_hash",
                columnNames = "token_hash"
        )
)
public class RefreshToken extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    public RefreshToken(Long userId, String tokenHash, Instant expiresAt) {
        this.userId = requireId(userId, "user id");
        this.tokenHash = requireText(tokenHash, "token hash");
        this.expiresAt = requireExpiry(expiresAt);
    }

    public boolean isActive(Instant now) {
        return revokedAt == null && expiresAt.isAfter(now);
    }

    public void revoke(Instant now) {
        if (revokedAt == null) {
            revokedAt = requireTime(now);
        }
    }

    private static Long requireId(Long value, String field) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(field + " must be positive");
        }
        return value;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value;
    }

    private static Instant requireExpiry(Instant value) {
        return requireTime(value);
    }

    private static Instant requireTime(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("time must not be null");
        }
        return value;
    }
}
