package com.recruitment.app.recovery;

import com.recruitment.app.modules.identity.application.AuthenticationThrottlingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuditTrailIntegrationTests extends RecoveryDatabaseTest {
    @Autowired AuthenticationThrottlingService limiter;

    @Test
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    void recordsDeniedAndThrottledLoginWithoutCredentialsEmailOrRawIp() throws Exception {
        limiter.resetAll();
        for(int i=0;i<6;i++) {
            var result=mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                    .header("X-Forwarded-For","198.51.100.99")
                    .content("{\"email\":\"private-audit@example.test\",\"password\":\"Synthetic-SECRET-123\"}"))
                    .andExpect(status().is(i<5?401:429)).andReturn().getResponse();
            if(i==5) assertNotNull(result.getHeader("Retry-After"));
            String requestId=result.getHeader("X-Request-ID");
            var rows=jdbc.queryForList("SELECT metadata_json,ip_address FROM audit_events WHERE action='AUTH_LOGIN' AND metadata_json LIKE ?",
                    "%"+requestId+"%");
            assertEquals(1,rows.size());
            String metadata=rows.getFirst().get("metadata_json").toString();
            assertTrue(metadata.contains(i<5?"401":"429"));
            assertFalse(metadata.contains("SECRET"));assertFalse(metadata.contains("@"));
            assertFalse(metadata.contains("198.51.100"));assertNull(rows.getFirst().get("ip_address"));
        }
        limiter.resetAll();
    }
}
