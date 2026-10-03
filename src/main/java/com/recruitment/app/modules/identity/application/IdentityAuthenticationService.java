package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.command.GoogleIdentityProfile;
import com.recruitment.app.modules.identity.application.command.PasswordLoginCommand;
import com.recruitment.app.modules.identity.application.command.RegisterAccountCommand;
import com.recruitment.app.modules.identity.application.exception.EmailAlreadyRegisteredException;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;
import java.util.Set;
import com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore;
import com.recruitment.app.modules.identity.domain.model.AccountSnapshot;

/**
 * Application use cases for locally authenticated identities and Google
 * identity provisioning. Authorization claims are minted only by
 * {@link TokenSessionService}, after account state is read from persistence.
 */
@Service
public class IdentityAuthenticationService {

    private static final int UNUSABLE_PASSWORD_BYTES = 48;

    private final IdentityAccountStore accounts;
    private final PasswordEncoder passwordEncoder;
    private final TokenSessionService tokenSessions;
    private final AuthenticationThrottlingService throttling;
    private final SecureRandom secureRandom = new SecureRandom();

    public IdentityAuthenticationService(IdentityAccountStore accounts,
            PasswordEncoder passwordEncoder, TokenSessionService tokenSessions) {
        this(accounts, passwordEncoder, tokenSessions, new AuthenticationThrottlingService());
    }

    @org.springframework.beans.factory.annotation.Autowired
    public IdentityAuthenticationService(IdentityAccountStore accounts,
            PasswordEncoder passwordEncoder, TokenSessionService tokenSessions,
            AuthenticationThrottlingService throttling) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.tokenSessions = tokenSessions;
        this.throttling = throttling != null ? throttling : new AuthenticationThrottlingService();
    }

    @Transactional
    public IssuedTokenPair register(RegisterAccountCommand command) {
        String email = normalizeEmail(command == null ? null : command.email());
        String fullName = requireFullName(command == null ? null : command.fullName());
        String password = requirePassword(command == null ? null : command.password());

        if (accounts.findByEmail(email).isPresent()) {
            throw new EmailAlreadyRegisteredException();
        }

        AccountSnapshot account = accounts.createCandidate(email, passwordEncoder.encode(password), fullName);
        return tokenSessions.issueFor(account.id());
    }

    @Transactional
    public IssuedTokenPair loginWithPassword(PasswordLoginCommand command) {
        String email = normalizeEmail(command == null ? null : command.email());
        String password = command == null ? null : command.password();

        throttling.checkThrottled(email);

        AccountSnapshot user = accounts.findByEmail(email).orElse(null);
        if (user == null || !user.active() || password == null || !passwordEncoder.matches(password, user.passwordHash())) {
            throttling.recordFailure(email);
            throw new IdentityAuthenticationException();
        }

        throttling.recordSuccess(email);

        if (passwordEncoder.upgradeEncoding(user.passwordHash())) {
            accounts.updatePassword(user.id(), passwordEncoder.encode(password));
        }

        return tokenSessions.issueFor(user.id());
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

        AccountSnapshot linkedAccount = accounts.lockGoogleAccount(subject).orElse(null);
        if (linkedAccount != null) {
            if (!linkedAccount.active()) {
                throw new IdentityAuthenticationException();
            }
            accounts.refreshGoogleProfile(subject, email, emailVerified);
            return linkedAccount.id();
        }

        if (!emailVerified) {
            throw new OAuthIdentityException("Google did not verify the account email address");
        }

        if (accounts.findByEmail(email).isPresent()) {
            throw new OAuthIdentityException("Google identity must be linked from an authenticated account");
        }

        AccountSnapshot account = accounts.createCandidate(email,
                passwordEncoder.encode(generateUnusablePassword()), displayName);
        accounts.bindGoogleIdentity(account.id(), subject, email);
        return account.id();
    }

    @Transactional
    public void linkGoogleAccount(Long userId, GoogleIdentityProfile profile) {
        String subject = requireText(profile == null ? null : profile.subject(), "Google subject");
        String email = normalizeEmail(profile == null ? null : profile.email());
        boolean emailVerified = profile != null && profile.emailVerified();

        java.util.Optional<AccountSnapshot> linkedAccount = accounts.lockGoogleAccount(subject);
        if (linkedAccount.isPresent()) {
            if (!linkedAccount.get().id().equals(userId)) {
                throw new com.recruitment.app.modules.identity.application.exception.OAuthIdentityConflictException("Google account is already linked to another user");
            }
            accounts.refreshGoogleProfile(subject, email, emailVerified);
            return;
        }

        accounts.bindGoogleIdentity(userId, subject, email);
    }

    @Transactional(readOnly = true)
    public AuthenticatedAccount currentAccount(Long userId) {
        AccountSnapshot account = accounts.findById(userId)
                .filter(AccountSnapshot::active)
                .orElseThrow(IdentityAuthenticationException::new);
        return new AuthenticatedAccount(account.id(), account.email(), account.fullName(), account.roles());
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
