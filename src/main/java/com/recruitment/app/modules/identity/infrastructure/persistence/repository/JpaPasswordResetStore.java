package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.port.out.PasswordResetStore;
import com.recruitment.app.modules.identity.domain.model.PasswordResetTokenSnapshot;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.PasswordResetToken;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
class JpaPasswordResetStore implements PasswordResetStore {

    private final PasswordResetTokenRepository tokens;

    JpaPasswordResetStore(PasswordResetTokenRepository tokens) {
        this.tokens = tokens;
    }

    @Override
    public void saveToken(Long userId, String tokenHash, Instant expiresAt) {
        tokens.saveAndFlush(new PasswordResetToken(userId, tokenHash, expiresAt));
    }

    @Override
    public Optional<PasswordResetTokenSnapshot> lockToken(String tokenHash) {
        return tokens.findByTokenHashForUpdate(tokenHash).map(JpaPasswordResetStore::snapshot);
    }

    @Override
    public void consumeToken(Long tokenId, Instant consumedAt) {
        tokens.findById(tokenId).ifPresent(token -> {
            token.consume(consumedAt);
            tokens.saveAndFlush(token);
        });
    }

    private static PasswordResetTokenSnapshot snapshot(PasswordResetToken token) {
        return new PasswordResetTokenSnapshot(token.getId(), token.getUserId(), token.getTokenHash(),
                token.getExpiresAt(), token.isConsumed());
    }
}
