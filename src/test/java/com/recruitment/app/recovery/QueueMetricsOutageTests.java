package com.recruitment.app.recovery;

import com.recruitment.app.modules.applications.infrastructure.observability.ScreeningQueueMetrics;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QueueMetricsOutageTests {
    @Test
    void databaseFailureIsUnavailableInsteadOfAHealthyZeroQueue() {
        var jdbc=mock(JdbcTemplate.class);
        doThrow(new IllegalStateException("synthetic failure")).when(jdbc).query(anyString(),any(RowCallbackHandler.class));
        var registry=new SimpleMeterRegistry();new ScreeningQueueMetrics(jdbc,registry);
        assertEquals(0,registry.get("smartrecruit.queue.metrics.available").gauge().value());
        assertTrue(Double.isNaN(registry.get("smartrecruit.screenings.pending").gauge().value()));
        verify(jdbc,times(1)).query(anyString(),any(RowCallbackHandler.class));
    }
}
