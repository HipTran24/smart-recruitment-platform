package com.recruitment.app.modules.applications.infrastructure.observability;

import io.micrometer.core.instrument.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.time.*;
import java.util.*;

/** Bounded labels and a five-second snapshot avoid per-series database queries on scrape. */
@Component
public class ScreeningQueueMetrics {
    private final JdbcTemplate jdbc;
    private volatile Snapshot cached;
    private volatile long expires;
    public ScreeningQueueMetrics(JdbcTemplate jdbc,MeterRegistry registry) {
        this.jdbc=jdbc;
        for(String status:List.of("PENDING","PROCESSING","FAILED")) {
            Gauge.builder("smartrecruit.screenings."+status.toLowerCase(Locale.ROOT),this,
                    value->value.snapshot().count(status)).register(registry);
        }
        Gauge.builder("smartrecruit.screenings.oldest.pending.seconds",this,value->value.snapshot().oldestPending()).register(registry);
        Gauge.builder("smartrecruit.screenings.expired.leases",this,value->value.snapshot().expiredLeases()).register(registry);
        Gauge.builder("smartrecruit.queue.metrics.available",this,value->value.snapshot().available()?1:0).register(registry);
    }
    private synchronized Snapshot snapshot() {
        long now=System.nanoTime();
        if (cached!=null && now<expires) return cached;
        try {
            Map<String,Long> counts=new HashMap<>();
            double[] values={0,0};
            jdbc.query("""
                    SELECT status,COUNT(*) AS total,MIN(created_at) AS oldest,
                    SUM(CASE WHEN status='PROCESSING' AND processing_lease_expires_at<UTC_TIMESTAMP() THEN 1 ELSE 0 END) AS expired
                    FROM application_screenings GROUP BY status
                    """,rs->{
                String status=rs.getString("status");counts.put(status,rs.getLong("total"));
                values[1]+=rs.getLong("expired");
                if("PENDING".equals(status)) {
                    Instant oldest=rs.getObject("oldest",LocalDateTime.class).toInstant(ZoneOffset.UTC);
                    values[0]=Math.max(0,Duration.between(oldest,Instant.now()).toSeconds());
                }
            });
            cached=new Snapshot(true,Map.copyOf(counts),values[0],values[1]);
        } catch(RuntimeException failure) { cached=new Snapshot(false,Map.of(),Double.NaN,Double.NaN); }
        expires=now+5_000_000_000L;
        return cached;
    }
    private record Snapshot(boolean available,Map<String,Long> counts,double oldestPending,double expiredLeases) {
        double count(String status) { return available?counts.getOrDefault(status,0L):Double.NaN; }
    }
}
