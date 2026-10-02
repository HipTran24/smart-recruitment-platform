package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.RefreshTokenSession;
import com.recruitment.app.modules.identity.application.RefreshTokenStore;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.RefreshToken;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

/**
 * JPA adapter for refresh-session persistence. The enclosing application
 * transaction owns the pessimistic lock acquired during rotation.
 */
@Component
class JpaRefreshTokenStore implements RefreshTokenStore {

    private final RefreshTokenRepository refreshTokenRepository;

    JpaRefreshTokenStore(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public Optional<RefreshTokenSession> lockByTokenHash(String tokenHash) {
        return refreshTokenRepository.findByTokenHashForUpdate(tokenHash)
                .map(JpaRefreshTokenStore::toSession);
    }

    @Override
    public void create(Long userId, String tokenHash, Instant expiresAt) {
        refreshTokenRepository.save(new RefreshToken(userId, tokenHash, expiresAt));
    }

    @Override
    public void revoke(Long refreshTokenId, Instant revokedAt) {
        refreshTokenRepository.revokeByIdIfActive(refreshTokenId, revokedAt);
    }

    @Override
    public int revokeAllActiveForUser(Long userId, Instant revokedAt, Instant now) {
        return refreshTokenRepository.revokeActiveByUserId(userId, revokedAt, now);
    }

    private static RefreshTokenSession toSession(RefreshToken token) {
        return new RefreshTokenSession(
                token.getId(),
                token.getUserId(),
                token.getTokenHash(),
                token.getExpiresAt(),
                token.getRevokedAt()
        );
    }
}
