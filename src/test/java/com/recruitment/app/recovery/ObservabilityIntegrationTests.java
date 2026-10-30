package com.recruitment.app.recovery;

import io.micrometer.observation.*;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.micrometer.metrics.test.autoconfigure.AutoConfigureMetrics;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMetrics
@SpringBootTest(properties={"management.endpoints.web.exposure.include=health,info,prometheus,metrics", "management.tracing.sampling.probability=1"})
class ObservabilityIntegrationTests extends RecoveryDatabaseTest {
    @Autowired ObservationRegistry observations;
    @Autowired Tracer tracer;
    @Autowired org.springframework.http.server.observation.ServerRequestObservationConvention convention;
    @Test
    void tracingDropsFullUrlsThatCouldContainOAuthCodes() {
        var request=new org.springframework.mock.web.MockHttpServletRequest("GET","/login/oauth2/code/google");
        request.setQueryString("code=synthetic-private-code");
        var context=new org.springframework.http.server.observation.ServerRequestObservationContext(request,new org.springframework.mock.web.MockHttpServletResponse());
        assertEquals(io.micrometer.common.KeyValues.empty(),convention.getHighCardinalityKeyValues(context));
    }
    @Test
    void metricsRequireAdminAndContainQueueSignalsWithoutCandidateIdentifiers() throws Exception {
        mvc.perform(get("/actuator/prometheus")).andExpect(status().isUnauthorized());
        for(String role:new String[]{"CANDIDATE","RECRUITER"}) {
            mvc.perform(get("/actuator/prometheus").with(user("123").roles(role))).andExpect(status().isForbidden());
        }
        String body=mvc.perform(get("/actuator/prometheus").with(user("123").roles("PLATFORM_ADMIN")))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertTrue(body.contains("smartrecruit_screenings_pending"));
        assertTrue(body.contains("smartrecruit_queue_metrics_available 1.0"));
        assertTrue(body.contains("smartrecruit_audit_persistence_failures_total"));
        assertFalse(body.contains("@example.test"));assertFalse(body.contains("candidate_profile_id"));
    }
    @Test
    void observationsCreateTraceAndSpanContextWithoutExportingData() {
        Observation.createNotStarted("ci.synthetic.operation",observations).observe(()->{
            assertNotNull(tracer.currentSpan());
            assertFalse(tracer.currentSpan().context().traceId().isBlank());
            assertFalse(tracer.currentSpan().context().spanId().isBlank());
        });
    }
}
