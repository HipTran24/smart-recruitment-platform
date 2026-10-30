package com.recruitment.app.modules.identity.infrastructure.bootstrap;

import com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@EnableConfigurationProperties(BootstrapAdminProperties.class)
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final IdentityAccountStore accounts;
    private final PasswordEncoder passwordEncoder;
    private final BootstrapAdminProperties properties;

    public AdminBootstrapRunner(
            IdentityAccountStore accounts,
            PasswordEncoder passwordEncoder,
            BootstrapAdminProperties properties
    ) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.enabled()) {
            return;
        }

        if (properties.password() == null || properties.password().length() < 12) {
            throw new IllegalStateException("Bootstrap admin is enabled but password is blank or shorter than 12 characters.");
        }

        if (accounts.existsByRole("ROLE_PLATFORM_ADMIN")) {
            log.debug("Platform admin account already exists. Skipping bootstrap.");
            return;
        }

        log.info("Bootstrapping platform administrator: {}", properties.email());
        accounts.createAdmin(
                properties.email(),
                passwordEncoder.encode(properties.password()),
                properties.fullName()
        );
        log.info("Platform administrator bootstrapped successfully.");
    }
}
