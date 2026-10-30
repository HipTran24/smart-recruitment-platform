package com.recruitment.app.modules.identity.infrastructure.bootstrap;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.identity.bootstrap-admin")
public record BootstrapAdminProperties(
        boolean enabled,
        String email,
        String password,
        String fullName
) {
    public BootstrapAdminProperties {
        if (email == null || email.isBlank()) {
            email = "admin@smartrecruit.local";
        }
        if (fullName == null || fullName.isBlank()) {
            fullName = "Platform Administrator";
        }
    }
}
