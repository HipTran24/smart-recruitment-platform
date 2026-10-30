package com.recruitment.app.modules.applications.application;

import com.recruitment.app.modules.applications.application.port.out.KpiStore;
import com.recruitment.app.modules.applications.domain.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.temporal.ChronoUnit;

@Service
@Transactional(readOnly = true)
public class KpiService {
    private final KpiStore store;
    public KpiService(KpiStore store) { this.store = store; }

    public KpiReport report(String from, String to, String timezone, Long jobId, String source) {
        LocalDate first = date(from, "from");
        LocalDate last = date(to, "to");
        long days = ChronoUnit.DAYS.between(first, last);
        if (days < 0 || days >= 366) throw new KpiFilterException("to", "Range must contain 1 to 366 days");
        ZoneId zone;
        try { zone = ZoneId.of(timezone); }
        catch (DateTimeException | NullPointerException ex) {
            throw new KpiFilterException("timezone", "Use a valid IANA timezone");
        }
        if (jobId != null && (jobId <= 0 || !store.jobExists(jobId))) {
            throw new KpiFilterException("jobId", "Job must exist and have a positive ID");
        }
        String normalized = null;
        if (source != null) {
            if (source.isBlank()) throw new KpiFilterException("source", "Source must not be blank");
            try { normalized = ApplicationSource.normalize(source); }
            catch (IllegalArgumentException ex) { throw new KpiFilterException("source", ex.getMessage()); }
        }
        try {
            return store.aggregate(new KpiQuery(first, last, zone.getId(), first.atStartOfDay(zone).toInstant(),
                    last.plusDays(1).atStartOfDay(zone).toInstant(), jobId, normalized));
        } catch (DateTimeException ex) { throw new KpiFilterException("to", "Date is outside the supported range"); }
    }

    private static LocalDate date(String value, String field) {
        try {
            LocalDate date = LocalDate.parse(value);
            if (date.getYear() < 2000 || date.getYear() > 2100) throw new DateTimeException("Unsupported year");
            return date;
        } catch (DateTimeException | NullPointerException ex) {
            throw new KpiFilterException(field, "Use an ISO date between 2000 and 2100");
        }
    }
}
