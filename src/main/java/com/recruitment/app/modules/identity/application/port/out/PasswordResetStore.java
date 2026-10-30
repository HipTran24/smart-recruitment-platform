package com.recruitment.app.modules.identity.application.port.out;

import com.recruitment.app.modules.identity.domain.model.PasswordResetTokenSnapshot;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetStore {
    void saveToken(Long userId, String tokenHash, Instant expiresAt);
    Optional<PasswordResetTokenSnapshot> lockToken(String tokenHash);
    void consumeToken(Long tokenId, Instant consumedAt);
}
