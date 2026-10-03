package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.JwtSubject;
import com.recruitment.app.modules.identity.application.JwtSubjectResolver;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Resolves current account activity and roles at token issue/refresh time,
 * rather than trusting stale claims from a previous token.
 */
@Component
class JpaJwtSubjectResolver implements JwtSubjectResolver {

    private final UserRepository users;

    JpaJwtSubjectResolver(UserRepository users) {
        this.users = users;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JwtSubject> findActiveSubject(Long userId) {
        if (userId == null || userId <= 0) {
            return Optional.empty();
        }

        return users.findByIdWithRoles(userId)
                .filter(User::isActive)
                .map(user -> new JwtSubject(
                        user.getId(),
                        user.getRoles().stream().map(role -> role.getCode()).collect(java.util.stream.Collectors.toSet()),
                        user.getCredentialVersion()
                ));
    }
}
