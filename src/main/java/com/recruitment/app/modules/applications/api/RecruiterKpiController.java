package com.recruitment.app.modules.applications.api;

import com.recruitment.app.common.api.error.ApiErrorResponse;
import com.recruitment.app.modules.applications.application.KpiFilterException;
import com.recruitment.app.modules.applications.application.KpiService;
import com.recruitment.app.modules.applications.domain.model.KpiReport;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recruiter/kpis")
@PreAuthorize("hasAuthority('ROLE_RECRUITER')")
public class RecruiterKpiController {
    private final KpiService service;
    public RecruiterKpiController(KpiService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<KpiReport> report(@RequestParam String from, @RequestParam String to,
            @RequestParam(defaultValue = "UTC") String timezone, @RequestParam(required = false) String jobId,
            @RequestParam(required = false) String source) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.report(from, to, timezone, parseJobId(jobId), source));
    }

    private static Long parseJobId(String value) {
        if (value == null) return null;
        try { return Long.valueOf(value); }
        catch (NumberFormatException ex) { throw new KpiFilterException("jobId", "Job must have a numeric ID"); }
    }

    @ExceptionHandler(KpiFilterException.class)
    ResponseEntity<ApiErrorResponse> invalidFilter(KpiFilterException ex) {
        return ResponseEntity.badRequest().cacheControl(CacheControl.noStore()).body(
                new ApiErrorResponse("INVALID_KPI_FILTER", "A KPI filter is invalid.", Map.of(ex.field(), ex.getMessage())));
    }
}
