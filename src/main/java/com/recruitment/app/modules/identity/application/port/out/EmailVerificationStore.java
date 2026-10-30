package com.recruitment.app.modules.identity.application.port.out;

import com.recruitment.app.modules.identity.domain.model.EmailVerificationTokenSnapshot;

import java.time.Instant;
import java.util.Optional;

public interface EmailVerificationStore {
    void saveToken(Long userId, String tokenHash, Instant expiresAt);
    Optional<EmailVerificationTokenSnapshot> lockToken(String tokenHash);
    void consumeToken(Long tokenId, Instant consumedAt);
}
