package com.recruitment.app.recovery;

import com.recruitment.app.common.infrastructure.config.ProductionEnvironmentGuard;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.mock.env.MockEnvironment;
import static org.junit.jupiter.api.Assertions.*;

class ProductionProfileLoadingTests {
    @Test
    void actualProductionProfileDisablesAutomaticMigrationsAndIncludesDatabaseReadiness() {
        var env=new MockEnvironment();env.setActiveProfiles("production");
        ConfigDataEnvironmentPostProcessor.applyTo(env);
        assertEquals("false",env.getProperty("spring.flyway.enabled"));
        assertEquals("validate",env.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertEquals("readinessState,db",env.getProperty("management.endpoint.health.group.readiness.include"));
        assertEquals("livenessState",env.getProperty("management.endpoint.health.group.liveness.include"));
        assertEquals("false",env.getProperty("app.test-mailbox.enabled"));
        assertEquals("true",env.getProperty("server.servlet.session.cookie.secure"));
        assertThrows(IllegalStateException.class,()->new ProductionEnvironmentGuard().postProcessEnvironment(env,null));
    }
}
