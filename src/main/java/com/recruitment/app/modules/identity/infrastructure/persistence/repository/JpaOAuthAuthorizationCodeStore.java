package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.port.out.OAuthAuthorizationCodeStore;
import com.recruitment.app.modules.identity.domain.model.OAuthCodeSnapshot;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.OAuthAuthorizationCode;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
class JpaOAuthAuthorizationCodeStore implements OAuthAuthorizationCodeStore {

    private final OAuthAuthorizationCodeRepository repository;

    JpaOAuthAuthorizationCodeStore(OAuthAuthorizationCodeRepository repository) {
        this.repository = repository;
    }

    @Override
    public void save(Long userId, String codeHash, String codeChallenge, String transactionId, Instant expiresAt) {
        repository.save(new OAuthAuthorizationCode(userId, codeHash, codeChallenge, transactionId, expiresAt));
    }

    @Override
    public Optional<OAuthCodeSnapshot> lockByCodeHash(String codeHash) {
        return repository.findByCodeHashForUpdate(codeHash)
                .map(this::toSnapshot);
    }

    @Override
    public void markConsumed(Long id, Instant consumedAt) {
        repository.findById(id).ifPresent(code -> code.consume(consumedAt));
    }

    private OAuthCodeSnapshot toSnapshot(OAuthAuthorizationCode entity) {
        return new OAuthCodeSnapshot(
                entity.getId(),
                entity.getUserId(),
                entity.getCodeHash(),
                entity.getCodeChallenge(),
                entity.getTransactionId(),
                entity.getExpiresAt(),
                entity.getConsumedAt()
        );
    }
}
