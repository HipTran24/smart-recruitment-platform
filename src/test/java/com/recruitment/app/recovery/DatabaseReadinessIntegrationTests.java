package com.recruitment.app.recovery;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.health.registry.HealthContributorRegistry;
import org.springframework.boot.health.contributor.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties="management.endpoint.health.group.readiness.include=readinessState,db")
class DatabaseReadinessIntegrationTests extends RecoveryDatabaseTest {
    @Autowired HealthContributorRegistry registry;
    @Test
    void databaseFailureRemovesReadinessButDoesNotFailLivenessOrExposeDetails() throws Exception {
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk());
        var database=registry.unregisterContributor("db");assertNotNull(database);
        try {
            registry.registerContributor("db",(HealthIndicator)()->Health.down().withDetail("private","synthetic-detail").build());
            mvc.perform(get("/actuator/health/readiness")).andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.status").value("DOWN")).andExpect(jsonPath("$.components").doesNotExist());
            mvc.perform(get("/actuator/health/liveness")).andExpect(status().isOk());
        } finally { registry.unregisterContributor("db");registry.registerContributor("db",database); }
    }
}
