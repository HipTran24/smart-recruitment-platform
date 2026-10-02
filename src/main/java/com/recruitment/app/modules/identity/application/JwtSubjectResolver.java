package com.recruitment.app.modules.identity.application;

import java.util.Optional;

/**
 * Application port for resolving an active identity and its current roles.
 *
 * <p>The account persistence adapter owns the implementation. Keeping this
 * contract separate prevents refresh-token handling from coupling directly to
 * a JPA user entity.</p>
 */
public interface JwtSubjectResolver {

    /**
     * Returns the subject only when the account currently exists and is
     * allowed to authenticate.
     */
    Optional<JwtSubject> findActiveSubject(Long userId);
}
