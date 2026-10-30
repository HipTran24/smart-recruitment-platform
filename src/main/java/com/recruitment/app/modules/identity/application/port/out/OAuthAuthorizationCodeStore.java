package com.recruitment.app.modules.identity.application.port.out;

import com.recruitment.app.modules.identity.domain.model.OAuthCodeSnapshot;

import java.time.Instant;
import java.util.Optional;

/**
 * Persistence contract for short-lived, single-use OAuth authorization codes.
 */
public interface OAuthAuthorizationCodeStore {

    void save(Long userId, String codeHash, String codeChallenge, String transactionId, Instant expiresAt);

    Optional<OAuthCodeSnapshot> lockByCodeHash(String codeHash);

    void markConsumed(Long id, Instant consumedAt);
}
