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
        name = "password_reset_tokens",
        indexes = @Index(name = "idx_password_reset_tokens_user_id", columnList = "user_id"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_password_reset_tokens_token_hash",
                columnNames = "token_hash"
        )
)
public class PasswordResetToken extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    public PasswordResetToken(Long userId, String tokenHash, Instant expiresAt) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        if (tokenHash == null || tokenHash.isBlank()) {
            throw new IllegalArgumentException("token hash must not be blank");
        }
        if (expiresAt == null) {
            throw new IllegalArgumentException("expires at must not be null");
        }
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public boolean isUsable(Instant now) {
        return usedAt == null && expiresAt.isAfter(now);
    }

    public void markUsed(Instant now) {
        if (!isUsable(now)) {
            throw new IllegalStateException("password reset token is no longer usable");
        }
        usedAt = now;
    }
}
