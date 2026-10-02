package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.command.GoogleIdentityProfile;
import com.recruitment.app.modules.identity.application.command.PasswordLoginCommand;
import com.recruitment.app.modules.identity.application.command.RegisterAccountCommand;
import com.recruitment.app.modules.identity.application.exception.EmailAlreadyRegisteredException;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.Role;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.UserOAuthIdentity;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.RoleRepository;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserOAuthIdentityRepository;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Application use cases for locally authenticated identities and Google
 * identity provisioning. Authorization claims are minted only by
 * {@link TokenSessionService}, after account state is read from persistence.
 */
@Service
public class IdentityAuthenticationService {

    private static final String CANDIDATE_ROLE = "ROLE_CANDIDATE";
    private static final int UNUSABLE_PASSWORD_BYTES = 48;

    private final UserRepository users;
    private final RoleRepository roles;
    private final UserOAuthIdentityRepository oauthIdentities;
    private final PasswordEncoder passwordEncoder;
    private final TokenSessionService tokenSessions;
    private final SecureRandom secureRandom = new SecureRandom();

    public IdentityAuthenticationService(
            UserRepository users,
            RoleRepository roles,
            UserOAuthIdentityRepository oauthIdentities,
            PasswordEncoder passwordEncoder,
            TokenSessionService tokenSessions
    ) {
        this.users = users;
        this.roles = roles;
        this.oauthIdentities = oauthIdentities;
        this.passwordEncoder = passwordEncoder;
        this.tokenSessions = tokenSessions;
    }

    @Transactional
    public IssuedTokenPair register(RegisterAccountCommand command) {
        String email = normalizeEmail(command == null ? null : command.email());
        String fullName = requireFullName(command == null ? null : command.fullName());
        String password = requirePassword(command == null ? null : command.password());

        if (users.findByEmail(email).isPresent()) {
            throw new EmailAlreadyRegisteredException();
        }

        User user = new User(email, passwordEncoder.encode(password), fullName);
        user.addRole(candidateRole());
        users.saveAndFlush(user);
        return tokenSessions.issueFor(user.getId());
    }

    @Transactional
    public IssuedTokenPair loginWithPassword(PasswordLoginCommand command) {
        String email = normalizeEmail(command == null ? null : command.email());
        String password = command == null ? null : command.password();

        User user = users.findByEmail(email).orElseThrow(IdentityAuthenticationException::new);
        if (!user.isActive() || password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IdentityAuthenticationException();
        }
        return tokenSessions.issueFor(user.getId());
    }

    public IssuedTokenPair refresh(String rawRefreshToken) {
        return tokenSessions.refresh(rawRefreshToken);
    }

    public void logout(String rawRefreshToken) {
        tokenSessions.revoke(rawRefreshToken);
    }

    /**
     * Resolves an already-linked stable Google subject or provisions a new
     * Google-only candidate. Existing local accounts are intentionally not
     * auto-linked by email: an email address can be reassigned by a provider,
     * so linking must happen through an explicit, authenticated account-link
     * flow.
     */
    @Transactional
    public Long resolveGoogleAccount(GoogleIdentityProfile profile) {
        String subject = requireText(profile == null ? null : profile.subject(), "Google subject");
        String email = normalizeEmail(profile == null ? null : profile.email());
        boolean emailVerified = profile != null && profile.emailVerified();
        String displayName = normalizedGoogleDisplayName(profile == null ? null : profile.displayName(), email);

        UserOAuthIdentity linkedIdentity = oauthIdentities
                .findForUpdate(UserOAuthIdentity.Provider.GOOGLE, subject)
                .orElse(null);
        if (linkedIdentity != null) {
            if (!linkedIdentity.getUser().isActive()) {
                throw new IdentityAuthenticationException();
            }
            linkedIdentity.refreshProfile(email, emailVerified);
            return linkedIdentity.getUser().getId();
        }

        if (!emailVerified) {
            throw new OAuthIdentityException("Google did not verify the account email address");
        }

        if (users.findByEmail(email).isPresent()) {
            throw new OAuthIdentityException("Google identity must be linked from an authenticated account");
        }

        User user = createGoogleOnlyAccount(email, displayName);

        oauthIdentities.saveAndFlush(new UserOAuthIdentity(
                user,
                UserOAuthIdentity.Provider.GOOGLE,
                subject,
                email,
                true
        ));
        return user.getId();
    }

    @Transactional(readOnly = true)
    public AuthenticatedAccount currentAccount(Long userId) {
        User user = users.findByIdWithRoles(userId)
                .filter(User::isActive)
                .orElseThrow(IdentityAuthenticationException::new);
        Set<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toUnmodifiableSet());
        return new AuthenticatedAccount(user.getId(), user.getEmail(), user.getFullName(), roleCodes);
    }

    private User createGoogleOnlyAccount(String email, String displayName) {
        User user = new User(email, passwordEncoder.encode(generateUnusablePassword()), displayName);
        user.addRole(candidateRole());
        return users.saveAndFlush(user);
    }

    private Role candidateRole() {
        return roles.findByCode(CANDIDATE_ROLE)
                .orElseThrow(() -> new IllegalStateException("Required candidate role is missing from the database"));
    }

    private String generateUnusablePassword() {
        byte[] bytes = new byte[UNUSABLE_PASSWORD_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String normalizeEmail(String value) {
        String email = requireText(value, "email").toLowerCase(Locale.ROOT);
        if (email.length() > 255 || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IdentityAuthenticationException();
        }
        return email;
    }

    private static String requireFullName(String value) {
        String fullName = requireText(value, "full name");
        if (fullName.length() > 150 || fullName.chars().anyMatch(Character::isISOControl)) {
            throw new IdentityAuthenticationException();
        }
        return fullName;
    }

    private static String requirePassword(String value) {
        if (value == null || value.length() < 12 || value.length() > 128) {
            throw new IdentityAuthenticationException();
        }
        return value;
    }

    private static String normalizedGoogleDisplayName(String displayName, String email) {
        String fallback = email.substring(0, email.indexOf('@'));
        String candidate = displayName == null || displayName.isBlank() ? fallback : displayName.strip();
        if (candidate.length() > 150) {
            candidate = candidate.substring(0, 150).strip();
        }
        return requireFullName(candidate);
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IdentityAuthenticationException();
        }
        return value.strip();
    }

    public record AuthenticatedAccount(Long id, String email, String fullName, Set<String> roleCodes) {
    }
}
