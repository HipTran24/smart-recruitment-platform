package com.recruitment.app.modules.identity.infrastructure.bootstrap;

import com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore;
import com.recruitment.app.modules.identity.domain.model.AccountSnapshot;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminBootstrapTests {

    private final IdentityAccountStore accounts = mock(IdentityAccountStore.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

    @Test
    void bootstrapsAdminWhenEnabledAndNoAdminExists() {
        when(accounts.existsByRole("ROLE_PLATFORM_ADMIN")).thenReturn(false);
        when(passwordEncoder.encode("super-secret-password-123")).thenReturn("encoded-hash");

        BootstrapAdminProperties properties = new BootstrapAdminProperties(
                true,
                "admin@smartrecruit.org",
                "super-secret-password-123",
                "Admin Boss"
        );

        AdminBootstrapRunner runner = new AdminBootstrapRunner(accounts, passwordEncoder, properties);
        runner.run(new DefaultApplicationArguments());

        verify(accounts).createAdmin("admin@smartrecruit.org", "encoded-hash", "Admin Boss");
    }

    @Test
    void skipsBootstrapWhenAdminAlreadyExists() {
        when(accounts.existsByRole("ROLE_PLATFORM_ADMIN")).thenReturn(true);

        BootstrapAdminProperties properties = new BootstrapAdminProperties(
                true,
                "admin@smartrecruit.org",
                "super-secret-password-123",
                "Admin Boss"
        );

        AdminBootstrapRunner runner = new AdminBootstrapRunner(accounts, passwordEncoder, properties);
        runner.run(new DefaultApplicationArguments());

        verify(accounts, never()).createAdmin(anyString(), anyString(), anyString());
    }

    @Test
    void skipsBootstrapWhenDisabled() {
        BootstrapAdminProperties properties = new BootstrapAdminProperties(
                false,
                "admin@smartrecruit.org",
                "super-secret-password-123",
                "Admin Boss"
        );

        AdminBootstrapRunner runner = new AdminBootstrapRunner(accounts, passwordEncoder, properties);
        runner.run(new DefaultApplicationArguments());

        verify(accounts, never()).existsByRole(anyString());
        verify(accounts, never()).createAdmin(anyString(), anyString(), anyString());
    }
}
