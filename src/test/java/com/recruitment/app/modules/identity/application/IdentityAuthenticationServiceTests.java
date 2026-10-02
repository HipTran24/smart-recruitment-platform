package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.command.GoogleIdentityProfile;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.RoleRepository;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserOAuthIdentityRepository;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class IdentityAuthenticationServiceTests {

    @Test
    void refusesToAutoLinkAGoogleSubjectToAnExistingEmailAccount() {
        UserRepository users = mock(UserRepository.class);
        UserOAuthIdentityRepository identities = mock(UserOAuthIdentityRepository.class);
        when(identities.findForUpdate(any(), any())).thenReturn(Optional.empty());
        when(users.findByEmail("candidate@example.test")).thenReturn(Optional.of(mock(User.class)));

        IdentityAuthenticationService service = new IdentityAuthenticationService(
                users,
                mock(RoleRepository.class),
                identities,
                mock(PasswordEncoder.class),
                mock(TokenSessionService.class)
        );

        assertThrows(OAuthIdentityException.class, () -> service.resolveGoogleAccount(new GoogleIdentityProfile(
                "google-subject-123",
                "candidate@example.test",
                true,
                "Candidate Example"
        )));

        verify(identities, never()).saveAndFlush(any());
    }
}
