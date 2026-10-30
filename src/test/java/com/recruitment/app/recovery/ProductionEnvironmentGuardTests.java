package com.recruitment.app.recovery;

import com.recruitment.app.common.infrastructure.config.ProductionEnvironmentGuard;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class ProductionEnvironmentGuardTests {
    private final ProductionEnvironmentGuard guard=new ProductionEnvironmentGuard();
    private MockEnvironment valid() {
        var env=new MockEnvironment();env.setActiveProfiles("production");
        Map.ofEntries(
                Map.entry("spring.datasource.url","jdbc:mysql://database.example.test/db?sslMode=VERIFY_IDENTITY"),
                Map.entry("spring.datasource.username","runtime_fixture"),Map.entry("spring.datasource.password","synthetic-ci-only-credential"),
                Map.entry("spring.jpa.hibernate.ddl-auto","validate"),Map.entry("spring.flyway.clean-disabled","true"),
                Map.entry("spring.flyway.enabled","false"),Map.entry("app.security.jwt.issuer","https://api.example.test"),
                Map.entry("app.security.jwt.audience","test-api"),Map.entry("app.security.jwt.key-id","ci-reference"),
                Map.entry("app.security.jwt.private-key-location","file:/run/secrets/private.pem"),
                Map.entry("app.security.jwt.public-key-location","file:/run/secrets/public.pem"),
                Map.entry("app.notification.provider","ses"),Map.entry("server.servlet.session.cookie.secure","true"),
                Map.entry("server.error.include-message","never"),Map.entry("server.error.include-stacktrace","never"),
                Map.entry("management.endpoint.health.show-details","never"),
                Map.entry("management.endpoint.health.group.readiness.include","readinessState,db"),
                Map.entry("app.web.cors.allowed-origins","https://app.example.test")
        ).forEach(env::setProperty);
        return env;
    }

    @Test
    void acceptsExternalSecretReferencesAndSeparatedMigrationIdentity() {
        var env=valid();assertDoesNotThrow(()->guard.postProcessEnvironment(env,null));
        env.setProperty("spring.flyway.enabled","true");
        env.setProperty("spring.flyway.user","migrator_fixture");
        env.setProperty("spring.flyway.password","synthetic-migration-credential");
        assertDoesNotThrow(()->guard.postProcessEnvironment(env,null));
        env.setProperty("spring.flyway.user","runtime_fixture");
        assertTrue(assertThrows(IllegalStateException.class,()->guard.postProcessEnvironment(env,null)).getMessage().contains("spring.flyway.user"));
    }

    @Test
    void rejectsUnsafeOverridesWithoutEchoingSecretValues() {
        String[][] bad={{"app.test-mailbox.enabled","true"},{"spring.jpa.hibernate.ddl-auto","update"},
                {"app.security.jwt.private-key-location","classpath:keys/test.pem"},{"spring.datasource.username","root"},
                {"spring.datasource.url","jdbc:mysql://db/no-tls"},{"app.notification.provider","logging"},
                {"server.servlet.session.cookie.secure","false"},{"server.error.include-stacktrace","always"},
                {"app.web.cors.allowed-origins","https://*.example.test"},{"spring.datasource.password","replace-SECRET"}};
        for(var invalid:bad) {
            var env=valid();env.setProperty(invalid[0],invalid[1]);
            String message=assertThrows(IllegalStateException.class,()->guard.postProcessEnvironment(env,null)).getMessage();
            assertTrue(message.contains(invalid[0]));assertFalse(message.contains("SECRET"));
        }
    }

    @Test
    void rejectsMixedTestProductionProfilesButLeavesIsolatedLocalTestsAlone() {
        var env=valid();env.setActiveProfiles("prod","test");
        assertThrows(IllegalStateException.class,()->guard.postProcessEnvironment(env,null));
        env.setActiveProfiles("test");env.setProperty("spring.datasource.username","root");
        assertDoesNotThrow(()->guard.postProcessEnvironment(env,null));
    }
}
