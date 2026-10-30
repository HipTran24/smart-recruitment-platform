package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.port.out.EmailVerificationStore;
import com.recruitment.app.modules.identity.domain.model.EmailVerificationTokenSnapshot;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.EmailVerificationToken;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
class JpaEmailVerificationStore implements EmailVerificationStore {

    private final EmailVerificationTokenRepository tokens;

    JpaEmailVerificationStore(EmailVerificationTokenRepository tokens) {
        this.tokens = tokens;
    }

    @Override
    public void saveToken(Long userId, String tokenHash, Instant expiresAt) {
        tokens.saveAndFlush(new EmailVerificationToken(userId, tokenHash, expiresAt));
    }

    @Override
    public Optional<EmailVerificationTokenSnapshot> lockToken(String tokenHash) {
        return tokens.findByTokenHashForUpdate(tokenHash).map(JpaEmailVerificationStore::snapshot);
    }

    @Override
    public void consumeToken(Long tokenId, Instant consumedAt) {
        tokens.findById(tokenId).ifPresent(token -> {
            token.consume(consumedAt);
            tokens.saveAndFlush(token);
        });
    }

    private static EmailVerificationTokenSnapshot snapshot(EmailVerificationToken token) {
        return new EmailVerificationTokenSnapshot(token.getId(), token.getUserId(), token.getTokenHash(),
                token.getExpiresAt(), token.isConsumed());
    }
}
