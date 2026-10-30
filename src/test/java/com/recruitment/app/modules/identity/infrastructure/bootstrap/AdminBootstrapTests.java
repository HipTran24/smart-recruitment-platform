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

    @Test
    void throwsIllegalStateExceptionWhenPasswordIsTooShort() {
        BootstrapAdminProperties properties = new BootstrapAdminProperties(
                true,
                "admin@smartrecruit.org",
                "short",
                "Admin Boss"
        );

        AdminBootstrapRunner runner = new AdminBootstrapRunner(accounts, passwordEncoder, properties);
        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalStateException.class,
                () -> runner.run(new DefaultApplicationArguments())
        );
    }

    @Test
    void bindsConfigurationPropertiesFromAppIdentityPrefix() {
        org.springframework.boot.test.context.runner.ApplicationContextRunner runner =
                new org.springframework.boot.test.context.runner.ApplicationContextRunner()
                        .withConfiguration(org.springframework.boot.autoconfigure.AutoConfigurations.of())
                        .withUserConfiguration(BootstrapAdminConfiguration.class)
                        .withPropertyValues(
                                "app.identity.bootstrap-admin.enabled=true",
                                "app.identity.bootstrap-admin.email=testadmin@smartrecruit.org",
                                "app.identity.bootstrap-admin.password=SuperSecret12345",
                                "app.identity.bootstrap-admin.full-name=Test Admin"
                        );

        runner.run(context -> {
            org.assertj.core.api.Assertions.assertThat(context).hasNotFailed();
            BootstrapAdminProperties props = context.getBean(BootstrapAdminProperties.class);
            org.assertj.core.api.Assertions.assertThat(props.enabled()).isTrue();
            org.assertj.core.api.Assertions.assertThat(props.email()).isEqualTo("testadmin@smartrecruit.org");
            org.assertj.core.api.Assertions.assertThat(props.password()).isEqualTo("SuperSecret12345");
            org.assertj.core.api.Assertions.assertThat(props.fullName()).isEqualTo("Test Admin");
        });
    }

    @org.springframework.boot.context.properties.EnableConfigurationProperties(BootstrapAdminProperties.class)
    static class BootstrapAdminConfiguration {
    }
}
