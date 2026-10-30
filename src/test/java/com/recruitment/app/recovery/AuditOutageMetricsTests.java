package com.recruitment.app.recovery;

import com.recruitment.app.modules.identity.application.AuditEventService;
import com.recruitment.app.modules.identity.infrastructure.security.SecurityAuditFilter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditOutageMetricsTests {
    @Test
    void auditFailureIsObservableWithoutReversingAnAlreadyCompletedMutation() throws Exception {
        var audit=mock(AuditEventService.class);doThrow(new IllegalStateException("synthetic-private-detail")).when(audit).recordSecurityEvent(any());
        var registry=new SimpleMeterRegistry();
        var filter=new SecurityAuditFilter(audit,registry);
        var request=new MockHttpServletRequest("POST","/api/v1/jobs/123/applications");
        var response=new MockHttpServletResponse();
        filter.doFilter(request,response,(req,res)->((jakarta.servlet.http.HttpServletResponse)res).setStatus(201));
        assertEquals(201,response.getStatus());
        assertEquals(1,registry.counter("smartrecruit.audit.persistence.failures").count());
    }
}
