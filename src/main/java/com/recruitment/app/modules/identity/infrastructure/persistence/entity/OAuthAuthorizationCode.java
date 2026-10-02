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

/**
 * Single-use, short-lived handoff code used after a browser OAuth login.
 * Only a SHA-256 digest is persisted, never the code returned to the browser.
 */
@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "oauth_authorization_codes",
        indexes = @Index(name = "idx_oauth_authorization_codes_expires_at", columnList = "expires_at"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_oauth_authorization_codes_code_hash",
                columnNames = "code_hash"
        )
)
public class OAuthAuthorizationCode extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "code_hash", nullable = false, length = 64)
    private String codeHash;

    @Column(name = "code_challenge", nullable = false, length = 128)
    private String codeChallenge;

    @Column(name = "transaction_id", nullable = false, length = 64)
    private String transactionId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    public OAuthAuthorizationCode(
            Long userId,
            String codeHash,
            String codeChallenge,
            String transactionId,
            Instant expiresAt
    ) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        if (codeHash == null || !codeHash.matches("[a-f0-9]{64}")) {
            throw new IllegalArgumentException("code hash must be a SHA-256 hex digest");
        }
        if (codeChallenge == null || !codeChallenge.matches("[A-Za-z0-9_-]{43}")) {
            throw new IllegalArgumentException("PKCE code challenge must be an S256 digest");
        }
        if (transactionId == null || !transactionId.matches("[A-Za-z0-9_-]{43}")) {
            throw new IllegalArgumentException("OAuth transaction id must contain 32 random bytes");
        }
        if (expiresAt == null) {
            throw new IllegalArgumentException("expiry must not be null");
        }
        this.userId = userId;
        this.codeHash = codeHash;
        this.codeChallenge = codeChallenge;
        this.transactionId = transactionId;
        this.expiresAt = expiresAt;
    }

    public boolean isUsable(Instant now) {
        return consumedAt == null && expiresAt.isAfter(requireTime(now));
    }

    public void consume(Instant now) {
        if (!isUsable(now)) {
            throw new IllegalStateException("authorization code is no longer usable");
        }
        consumedAt = now;
    }

    private static Instant requireTime(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("time must not be null");
        }
        return value;
    }
}
