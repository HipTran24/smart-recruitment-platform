package com.recruitment.app.modules.identity.infrastructure.security;

import com.recruitment.app.common.api.context.RequestContext;
import com.recruitment.app.modules.identity.application.AuditEventService;
import com.recruitment.app.modules.identity.domain.model.AuditEventSnapshot;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.*;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Component
@Order(-110) // Wrap Spring Security (-100), so rejected requests are also audited.
public class SecurityAuditFilter extends OncePerRequestFilter {
    private static final Logger LOG = LoggerFactory.getLogger(SecurityAuditFilter.class);
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final Map<String,String> AUTH = Map.ofEntries(
            Map.entry("/login","AUTH_LOGIN"),Map.entry("/register","AUTH_REGISTER"),
            Map.entry("/refresh","AUTH_REFRESH"),Map.entry("/logout","AUTH_LOGOUT"),
            Map.entry("/password/change","PASSWORD_CHANGE"),Map.entry("/password/reset-request","PASSWORD_RESET_REQUEST"),
            Map.entry("/password/reset-confirm","PASSWORD_RESET_CONFIRM"),Map.entry("/verify-email","VERIFY_EMAIL"),
            Map.entry("/oauth/exchange","OAUTH_EXCHANGE"));
    private final AuditEventService audit;
    private final io.micrometer.core.instrument.Counter failures;
    public SecurityAuditFilter(AuditEventService audit,io.micrometer.core.instrument.MeterRegistry registry) {
        this.audit = audit;
        this.failures = registry.counter("smartrecruit.audit.persistence.failures");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)
            throws ServletException,IOException {
        String action = action(request);
        boolean completed=false;
        try { chain.doFilter(request,response); completed=true; }
        finally {
            if (action != null) record(request,completed ? response.getStatus() : 500,action);
        }
    }

    private void record(HttpServletRequest request,int status,String action) {
        try {
            Object actor = request.getAttribute("smartrecruit.authenticatedUserId");
            Long userId = actor instanceof Long value ? value : null;
            String metadata = JSON.writeValueAsString(Map.of("status",status,"method",request.getMethod(),
                    "requestId",Objects.toString(RequestContext.requestId(),"")));
            audit.recordSecurityEvent(new AuditEventSnapshot(null,Instant.now(),userId,action,"API",null,metadata,null));
        } catch (RuntimeException failure) {
            failures.increment();
            // Do not turn a completed business request into a retryable duplicate mutation.
            LOG.error("Security audit persistence failed: type={}, requestId={}",failure.getClass().getSimpleName(),RequestContext.requestId());
        }
    }

    private static String action(HttpServletRequest request) {
        String path=request.getRequestURI();
        if (path.startsWith("/api/v1/auth/")) return AUTH.get(path.substring("/api/v1/auth".length()));
        if (path.startsWith("/api/v1/") && Set.of("POST","PUT","PATCH","DELETE").contains(request.getMethod())) return "API_MUTATION";
        return null;
    }
}
