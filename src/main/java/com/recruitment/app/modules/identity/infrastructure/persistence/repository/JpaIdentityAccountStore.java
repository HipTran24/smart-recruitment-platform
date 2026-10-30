package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore;
import com.recruitment.app.modules.identity.domain.model.AccountSnapshot;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.Role;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.UserOAuthIdentity;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
class JpaIdentityAccountStore implements IdentityAccountStore {
    private final UserRepository users;
    private final RoleRepository roles;
    private final UserOAuthIdentityRepository googleIdentities;

    JpaIdentityAccountStore(UserRepository users, RoleRepository roles,
                            UserOAuthIdentityRepository googleIdentities) {
        this.users = users;
        this.roles = roles;
        this.googleIdentities = googleIdentities;
    }

    @Override
    public Optional<AccountSnapshot> findByEmail(String email) {
        return users.findByEmail(email).map(JpaIdentityAccountStore::snapshot);
    }

    @Override
    public Optional<AccountSnapshot> findById(Long id) {
        return users.findByIdWithRoles(id).map(JpaIdentityAccountStore::snapshot);
    }

    @Override
    public Optional<AccountSnapshot> findForUpdate(Long id) {
        return users.findByIdForUpdate(id).map(JpaIdentityAccountStore::snapshot);
    }

    @Override
    public AccountSnapshot createCandidate(String email, String passwordHash, String fullName) {
        Role candidateRole = roles.findByCode("ROLE_CANDIDATE")
                .orElseThrow(() -> new IllegalStateException("Required candidate role is missing"));
        User user = new User(email, passwordHash, fullName);
        user.addRole(candidateRole);
        return snapshot(users.saveAndFlush(user));
    }

    @Override
    public AccountSnapshot createAdmin(String email, String passwordHash, String fullName) {
        Role adminRole = roles.findByCode("ROLE_PLATFORM_ADMIN")
                .orElseThrow(() -> new IllegalStateException("Required admin role is missing"));
        User user = new User(email, passwordHash, fullName);
        user.addRole(adminRole);
        user.verifyEmail();
        return snapshot(users.saveAndFlush(user));
    }

    @Override
    public Optional<AccountSnapshot> lockGoogleAccount(String subject) {
        return googleIdentities.findForUpdate(UserOAuthIdentity.Provider.GOOGLE, subject)
                .map(identity -> snapshot(identity.getUser()));
    }

    @Override
    public void refreshGoogleProfile(String subject, String email, boolean verified) {
        googleIdentities.findForUpdate(UserOAuthIdentity.Provider.GOOGLE, subject)
                .orElseThrow(() -> new IllegalStateException("Google identity no longer exists"))
                .refreshProfile(email, verified);
    }

    @Override
    public void bindGoogleIdentity(Long userId, String subject, String email) {
        googleIdentities.saveAndFlush(new UserOAuthIdentity(users.getReferenceById(userId),
                UserOAuthIdentity.Provider.GOOGLE, subject, email, true));
    }

    @Override
    public void updatePassword(Long userId, String newPasswordHash) {
        User user = users.findByIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.changePassword(newPasswordHash);
        users.saveAndFlush(user);
    }

    @Override
    public void markEmailVerified(Long userId) {
        User user = users.findByIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.verifyEmail();
        users.saveAndFlush(user);
    }

    @Override
    public boolean existsByRole(String roleCode) {
        return users.existsByActiveRoleCode(roleCode);
    }

    @Override
    public boolean isAccountLive(Long userId, int expectedCredentialVersion) {
        return users.isAccountLive(userId, expectedCredentialVersion);
    }

    private static AccountSnapshot snapshot(User user) {
        return new AccountSnapshot(user.getId(), user.getEmail(), user.getFullName(),
                user.getPasswordHash(), user.isActive(), user.getCredentialVersion(),
                user.isEmailVerified(), user.getRoles().stream()
                .map(Role::getCode).collect(Collectors.toUnmodifiableSet()));
    }
}
