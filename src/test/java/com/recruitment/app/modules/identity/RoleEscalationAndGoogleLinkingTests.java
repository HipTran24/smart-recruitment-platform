package com.recruitment.app.modules.identity;

import com.recruitment.app.ApplicationTests;
import com.recruitment.app.modules.identity.application.IdentityAuthenticationService;
import com.recruitment.app.modules.identity.application.command.GoogleIdentityProfile;
import com.recruitment.app.modules.identity.application.command.RegisterAccountCommand;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityConflictException;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.Role;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.RoleRepository;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class RoleEscalationAndGoogleLinkingTests {

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!ApplicationTests.MYSQL.isRunning()) {
            ApplicationTests.MYSQL.start();
        }
        registry.add("spring.datasource.url", ApplicationTests.MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", ApplicationTests.MYSQL::getUsername);
        registry.add("spring.datasource.password", ApplicationTests.MYSQL::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private IdentityAuthenticationService identityService;

    @Test
    void platformAdminCannotHoldRecruiterRoleAndViceVersa() {
        Role adminRole = roleRepository.findByCode("ROLE_PLATFORM_ADMIN").orElseThrow();
        Role recruiterRole = roleRepository.findByCode("ROLE_RECRUITER").orElseThrow();

        // Admin cannot add Recruiter role
        User admin = new User("admin-test@example.test", "hash", "Admin Tester");
        admin.addRole(adminRole);
        assertThrows(IllegalStateException.class, () -> admin.addRole(recruiterRole),
                "Platform Administrator must never hold the Recruiter role per ADR 0003");

        // Recruiter cannot add Admin role
        User recruiter = new User("recruiter-test@example.test", "hash", "Recruiter Tester");
        recruiter.addRole(recruiterRole);
        assertThrows(IllegalStateException.class, () -> recruiter.addRole(adminRole),
                "Recruiter must never hold the Platform Admin role per ADR 0003");
    }

    @Test
    void googleAccountLinkingEnforcesUniquenessAcrossAccounts() {
        var user1Tokens = identityService.register(new RegisterAccountCommand("User One", "user1@link.test", "Password-123456"));
        var user2Tokens = identityService.register(new RegisterAccountCommand("User Two", "user2@link.test", "Password-123456"));

        Long user1Id = userRepository.findByEmail("user1@link.test").orElseThrow().getId();
        Long user2Id = userRepository.findByEmail("user2@link.test").orElseThrow().getId();

        GoogleIdentityProfile profile = new GoogleIdentityProfile("google-shared-sub", "user1@gmail.com", true, "User One Google");

        // User 1 links Google account - succeeds
        identityService.linkGoogleAccount(user1Id, profile);

        // User 2 tries to link same Google account - fails with conflict
        assertThrows(OAuthIdentityConflictException.class, () ->
                identityService.linkGoogleAccount(user2Id, profile));
    }
}
