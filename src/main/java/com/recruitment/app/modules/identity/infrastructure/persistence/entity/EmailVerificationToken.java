package com.recruitment.app.modules.identity.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "email_verification_tokens",
        uniqueConstraints = @UniqueConstraint(name = "uk_email_verification_tokens_token_hash", columnNames = "token_hash")
)
public class EmailVerificationToken extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    public EmailVerificationToken(Long userId, String tokenHash, Instant expiresAt) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        if (tokenHash == null || tokenHash.isBlank()) {
            throw new IllegalArgumentException("token hash must not be blank");
        }
        this.userId = userId;
        this.tokenHash = tokenHash.strip();
        this.expiresAt = Objects.requireNonNull(expiresAt, "expires at must not be null");
    }

    public boolean isConsumed() {
        return consumedAt != null;
    }

    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }

    public void consume(Instant now) {
        if (consumedAt != null) {
            throw new IllegalStateException("token is already consumed");
        }
        this.consumedAt = Objects.requireNonNull(now, "consumed at must not be null");
    }
}
