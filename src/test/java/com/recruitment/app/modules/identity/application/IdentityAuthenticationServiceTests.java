package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.command.GoogleIdentityProfile;
import com.recruitment.app.modules.identity.application.command.PasswordLoginCommand;
import com.recruitment.app.modules.identity.application.command.RegisterAccountCommand;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore;
import com.recruitment.app.modules.identity.domain.model.AccountSnapshot;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class IdentityAuthenticationServiceTests {
    private final IdentityAccountStore accounts = mock(IdentityAccountStore.class);
    private final PasswordEncoder passwords = mock(PasswordEncoder.class);
    private final TokenSessionService tokens = mock(TokenSessionService.class);
    private final AuthenticationThrottlingService throttling = new AuthenticationThrottlingService();
    private final EmailVerificationService verificationService = mock(EmailVerificationService.class);
    private final com.recruitment.app.modules.identity.application.port.out.AccountNotificationGateway notifications =
            mock(com.recruitment.app.modules.identity.application.port.out.AccountNotificationGateway.class);
    private final IdentityAuthenticationService service =
            new IdentityAuthenticationService(accounts, passwords, tokens, throttling, verificationService, notifications);

    @Test
    void refusesEmailOnlyGoogleAutoLinking() {
        when(accounts.lockGoogleAccount("subject")).thenReturn(Optional.empty());
        when(accounts.findByEmail("candidate@example.test")).thenReturn(Optional.of(account(true)));
        assertThrows(OAuthIdentityException.class, () -> service.resolveGoogleAccount(google(true)));
        verify(accounts, never()).bindGoogleIdentity(any(), any(), any());
        verify(accounts, never()).createCandidate(any(), any(), any());
    }

    @Test
    void refusesInactiveLinkedGoogleAccount() {
        when(accounts.lockGoogleAccount("subject")).thenReturn(Optional.of(account(false)));
        assertThrows(IdentityAuthenticationException.class, () -> service.resolveGoogleAccount(google(true)));
        verify(accounts, never()).refreshGoogleProfile(any(), any(), anyBoolean());
    }

    @Test
    void refusesUnverifiedNewGoogleAccount() {
        when(accounts.lockGoogleAccount("subject")).thenReturn(Optional.empty());
        assertThrows(OAuthIdentityException.class, () -> service.resolveGoogleAccount(google(false)));
        verify(accounts, never()).createCandidate(any(), any(), any());
    }

    @Test
    void localRegistrationNormalizesEmailAndCreatesCandidateThroughPort() {
        when(accounts.findByEmail("candidate@example.test")).thenReturn(Optional.empty());
        when(passwords.encode("long-password-value")).thenReturn("encoded-password");
        when(accounts.createCandidate("candidate@example.test", "encoded-password", "Candidate"))
                .thenReturn(account(true));
        service.register(new RegisterAccountCommand("Candidate", " CANDIDATE@example.test ",
                "long-password-value"));
        verify(tokens).issueFor(7L);
    }

    @Test
    void inactivePasswordAccountNeverReceivesTokens() {
        when(accounts.findByEmail("candidate@example.test")).thenReturn(Optional.of(account(false)));
        assertThrows(IdentityAuthenticationException.class, () -> service.loginWithPassword(
                new PasswordLoginCommand("candidate@example.test", "long-password-value")));
        verifyNoInteractions(tokens);
    }

    private static AccountSnapshot account(boolean active) {
        return new AccountSnapshot(7L, "candidate@example.test", "Candidate", "hash", active,
                Set.of("ROLE_CANDIDATE"));
    }

    private static GoogleIdentityProfile google(boolean verified) {
        return new GoogleIdentityProfile("subject", "candidate@example.test", verified, "Candidate");
    }
}
