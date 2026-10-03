package com.recruitment.app.modules.identity.application.port.out;

import com.recruitment.app.modules.identity.domain.model.AccountSnapshot;

import java.util.Optional;

/** Persistence contract used within identity application transactions. */
public interface IdentityAccountStore {
    Optional<AccountSnapshot> findByEmail(String email);
    Optional<AccountSnapshot> findById(Long id);
    Optional<AccountSnapshot> findForUpdate(Long id);
    AccountSnapshot createCandidate(String email, String passwordHash, String fullName);
    AccountSnapshot createAdmin(String email, String passwordHash, String fullName);
    Optional<AccountSnapshot> lockGoogleAccount(String subject);
    void refreshGoogleProfile(String subject, String email, boolean verified);
    void bindGoogleIdentity(Long userId, String subject, String email);
    void updatePassword(Long userId, String newPasswordHash);
    void markEmailVerified(Long userId);
    boolean existsByRole(String roleCode);
    boolean isAccountLive(Long userId, int expectedCredentialVersion);
}
